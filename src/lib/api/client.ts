// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {ApiError, GoogleAuthResponse, TokenPair, User} from '@/types';

// Extend AxiosRequestConfig to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

class ApiClient {
	private client: AxiosInstance;
	private csrfToken: string | null = null;
	private accessToken: string | null = null; // Хранится только в памяти
	private refreshPromise: Promise<string> | null = null; // Для предотвращения одновременных refresh

	constructor() {
		this.client = axios.create({
			baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
			timeout: 10000,
			withCredentials: true, // Важно! Для работы с HttpOnly cookies
			headers: {
				'Content-Type': 'application/json',
			},
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		// Request interceptor
		this.client.interceptors.request.use(
			(config) => {
				// Add CSRF token to unsafe methods
				if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
					if (this.csrfToken) {
						config.headers['X-CSRF-Token'] = this.csrfToken;
					}
				}

				// Add access token from memory
				if (this.accessToken) {
					config.headers.Authorization = `Bearer ${this.accessToken}`;
				}

				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor
		this.client.interceptors.response.use(
			(response: AxiosResponse) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as ExtendedAxiosRequestConfig;

				// Handle 401 errors (access token expired)
				if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
					originalRequest._retry = true;

					try {
						// Prevent multiple simultaneous refresh attempts
						if (this.refreshPromise) {
							const newAccessToken = await this.refreshPromise;
							this.accessToken = newAccessToken;
						} else {
							this.refreshPromise = this.refreshAccessToken();
							const newAccessToken = await this.refreshPromise;
							this.accessToken = newAccessToken;
							this.refreshPromise = null;
						}

						// Retry original request with new token
						if (originalRequest.headers && this.accessToken) {
							originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
						}
						return this.client(originalRequest);
					} catch (refreshError) {
						// Refresh failed, redirect to login
						this.clearAuth();
						if (typeof window !== 'undefined') {
							window.location.href = '/auth/login';
						}
					}
				}

				return Promise.reject(this.handleError(error));
			}
		);
	}

	private handleError(error: AxiosError): ApiError {
		if (error.response?.data) {
			return error.response.data as ApiError;
		}

		if (error.code === 'ECONNABORTED') {
			return { error: 'Request timeout' };
		}

		if (!error.response) {
			return { error: 'Network error' };
		}

		return {
			error: error.message || 'An unexpected error occurred',
			details: error.response?.statusText
		};
	}

	// Token management (access token only in memory)
	setAccessToken(token: string): void {
		this.accessToken = token;
	}

	clearAuth(): void {
		this.accessToken = null;
		this.csrfToken = null;
		this.refreshPromise = null;
	}

	isAuthenticated(): boolean {
		return !!this.accessToken;
	}

	// CSRF token management
	async getCSRFToken(): Promise<string> {
		try {
			const response = await this.client.get('/api/v1/csrf-token');
			this.csrfToken = response.data.csrf_token;
			return this.csrfToken!;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	// Auth methods
	async getGoogleAuthUrl(): Promise<GoogleAuthResponse> {
		try {
			const response = await this.client.get('/api/v1/auth/web/google');
			return response.data.auth_url;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	async exchangeAuthCode(authCode: string): Promise<{ user: User; accessToken: string }> {
		try {
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			const response = await this.client.post('/api/v1/auth/web/exchange-code', {
				auth_code: authCode
			});

			const { user, tokens } = response.data;

			// Храним только access token в памяти
			// Refresh token автоматически сохранится как HttpOnly cookie на бэкенде
			this.accessToken = tokens.access_token;

			return { user, accessToken: tokens.access_token };
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	// Refresh tokens using HttpOnly cookie
	private async refreshAccessToken(): Promise<string> {
		try {
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			// Отправляем запрос БЕЗ refresh_token в теле - он в HttpOnly cookie
			const response = await this.client.post('/api/v1/auth/refresh', {});

			return response.data.tokens.access_token;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	async logout(): Promise<void> {
		try {
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			// Отправляем запрос БЕЗ refresh_token в теле - он в HttpOnly cookie
			await this.client.post('/api/v1/auth/logout', {});

			this.clearAuth();
		} catch (error) {
			// Очищаем локальное состояние даже если запрос не удался
			this.clearAuth();
			throw this.handleError(error as AxiosError);
		}
	}

	// User methods
	async getProfile(): Promise<User> {
		try {
			const response = await this.client.get('/api/v1/profile');
			return response.data.user;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	async updateProfile(data: { name: string; picture?: string }): Promise<User> {
		try {
			if (!this.csrfToken) {
				await this.getCSRFToken();
			}

			const response = await this.client.put('/api/v1/profile', data);
			return response.data.user;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	// Check if we have valid session (access token or can refresh)
	async checkSession(): Promise<{ user: User; accessToken: string } | null> {
		try {
			// Если есть access token, проверяем его
			if (this.accessToken) {
				const user = await this.getProfile();
				return { user, accessToken: this.accessToken };
			}

			// Если нет access token, пытаемся обновить через HttpOnly cookie
			const newAccessToken = await this.refreshAccessToken();
			this.accessToken = newAccessToken;

			const user = await this.getProfile();
			return { user, accessToken: newAccessToken };
		} catch (error) {
			// Нет валидной сессии
			return null;
		}
	}
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
