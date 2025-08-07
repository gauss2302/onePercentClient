// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, User } from '@/types';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
	_isRefreshCall?: boolean;
}

class ApiClient {
	private client: AxiosInstance;
	private csrfToken: string | null = null;
	private refreshPromise: Promise<void> | null = null;
	private isRefreshing = false;
	private failedQueue: Array<{
		resolve: (value?: any) => void;
		reject: (error: any) => void;
	}> = [];

	constructor() {
		this.client = axios.create({
			baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
			timeout: 15000,
			withCredentials: true, // Critical for HttpOnly cookies
			headers: {
				'Content-Type': 'application/json',
			},
		});

		this.setupInterceptors();
	}

	private processQueue(error: Error | null = null) {
		this.failedQueue.forEach(prom => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve();
			}
		});

		this.failedQueue = [];
	}

	private setupInterceptors() {
		// Request interceptor
		this.client.interceptors.request.use(
			async (config) => {
				const extendedConfig = config as ExtendedAxiosRequestConfig;

				// CRITICAL: Don't add CSRF or retry logic to refresh calls
				if (extendedConfig._isRefreshCall) {
					return config;
				}

				// Add CSRF token to unsafe methods
				if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
					if (!this.csrfToken) {
						try {
							await this.ensureCSRFToken();
						} catch (error) {
							console.error('Failed to get CSRF token:', error);
						}
					}

					if (this.csrfToken) {
						config.headers['X-CSRF-Token'] = this.csrfToken;
					}
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

				// CRITICAL: Never retry refresh calls to prevent infinite loops
				if (originalRequest?._isRefreshCall) {
					return Promise.reject(error);
				}

				// Handle CSRF token errors (403)
				if (error.response?.status === 403 && originalRequest && !originalRequest._retry) {
					originalRequest._retry = true;

					// Clear and refetch CSRF token
					this.csrfToken = null;

					try {
						await this.ensureCSRFToken();

						if (originalRequest.headers && this.csrfToken) {
							originalRequest.headers['X-CSRF-Token'] = this.csrfToken;
						}

						return this.client(originalRequest);
					} catch (csrfError) {
						return Promise.reject(error);
					}
				}

				// Handle 401 errors (authentication required)
				if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
					// Skip auth endpoints to prevent loops
					const isAuthEndpoint = originalRequest.url?.includes('/auth/');
					if (isAuthEndpoint) {
						return Promise.reject(error);
					}

					if (this.isRefreshing) {
						// If already refreshing, queue this request
						return new Promise((resolve, reject) => {
							this.failedQueue.push({ resolve, reject });
						}).then(() => {
							return this.client(originalRequest);
						}).catch(err => {
							return Promise.reject(err);
						});
					}

					originalRequest._retry = true;
					this.isRefreshing = true;

					return new Promise((resolve, reject) => {
						this.refreshAccessToken()
							.then(() => {
								this.processQueue();
								resolve(this.client(originalRequest));
							})
							.catch((err) => {
								this.processQueue(err);
								this.handleAuthFailure();
								reject(err);
							})
							.finally(() => {
								this.isRefreshing = false;
							});
					});
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

	private handleAuthFailure(): void {
		// Clear local state
		this.clearAuth();

		// Dispatch event for auth store to handle
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('auth:logout'));

			// Only redirect if not already on login page
			if (!window.location.pathname.includes('/auth/login')) {
				window.location.href = '/auth/login';
			}
		}
	}

	clearAuth(): void {
		this.csrfToken = null;
		this.refreshPromise = null;
		this.isRefreshing = false;
		this.failedQueue = [];
	}

	// CSRF token management
	private async ensureCSRFToken(): Promise<string> {
		if (this.csrfToken) {
			return this.csrfToken;
		}

		try {
			const response = await this.client.get('/api/v1/csrf-token', {
				_isRefreshCall: true // Prevent interceptor loops
			} as ExtendedAxiosRequestConfig);

			this.csrfToken = response.data.csrf_token;
			return this.csrfToken!;
		} catch (error) {
			console.error('Failed to get CSRF token:', error);
			throw this.handleError(error as AxiosError);
		}
	}

	async getCSRFToken(): Promise<string> {
		return this.ensureCSRFToken();
	}

	// Auth methods
	async getGoogleAuthUrl(): Promise<string> {
		try {
			const response = await this.client.get('/api/v1/auth/web/google');
			return response.data.auth_url;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	async exchangeAuthCode(authCode: string): Promise<{ user: User; tokens: { access_token: string } }> {
		try {
			await this.ensureCSRFToken();

			const response = await this.client.post('/api/v1/auth/web/exchange-code', {
				auth_code: authCode
			});

			const { user, tokens } = response.data;

			return { user, tokens };
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	// Refresh tokens using HttpOnly cookie
	private async refreshAccessToken(): Promise<void> {
		// Prevent multiple simultaneous refresh attempts
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = (async () => {
			try {
				// Ensure we have CSRF token before refresh
				if (!this.csrfToken) {
					try {
						const csrfResponse = await this.client.get('/api/v1/csrf-token', {
							_isRefreshCall: true
						} as ExtendedAxiosRequestConfig);
						this.csrfToken = csrfResponse.data.csrf_token;
					} catch (csrfError) {
						console.error('Failed to get CSRF token for refresh:', csrfError);
					}
				}

				// CRITICAL: Mark this as a refresh call to prevent interceptor loops
				const config: ExtendedAxiosRequestConfig = {
					_isRefreshCall: true,
					headers: {}
				} as ExtendedAxiosRequestConfig;

				// Add CSRF token if available
				if (this.csrfToken && config.headers) {
					config.headers['X-CSRF-Token'] = this.csrfToken;
				}

				const response = await this.client.post('/api/v1/auth/refresh', {}, config);

				// Backend returns new access token and sets new cookies
				console.log('✅ Token refreshed successfully');
			} catch (error) {
				console.error('❌ Token refresh failed:', error);
				throw error;
			} finally {
				this.refreshPromise = null;
			}
		})();

		return this.refreshPromise;
	}

	async logout(): Promise<void> {
		try {
			await this.ensureCSRFToken();

			// Mark as refresh call to prevent interceptor interference
			await this.client.post('/api/v1/auth/logout', {}, {
				_isRefreshCall: true
			} as ExtendedAxiosRequestConfig);

			this.clearAuth();
		} catch (error) {
			// Clear local state even if request fails
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
			await this.ensureCSRFToken();

			const response = await this.client.put('/api/v1/profile', data);
			return response.data.user;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}

	// Check if we have valid session
	async checkSession(): Promise<{ user: User } | null> {
		try {
			// This will trigger token refresh if needed via interceptors
			const user = await this.getProfile();
			return { user };
		} catch (error) {
			// No valid session - return null instead of throwing
			return null;
		}
	}

	// Health check
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.client.get('/api/v1/health', {
				_isRefreshCall: true // Prevent auth checks on health endpoint
			} as ExtendedAxiosRequestConfig);
			return response.status === 200;
		} catch {
			return false;
		}
	}
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
