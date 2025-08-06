// src/lib/utils/index.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Format date utilities
export function formatDate(date: string | Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
	const now = new Date();
	const targetDate = new Date(date);
	const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'just now';
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}
}

// URL utilities
export function getBaseUrl(): string {
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}

	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	return 'http://localhost:3000';
}

export function createAbsoluteUrl(path: string): string {
	return `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

// Auth utilities
export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		const currentTime = Date.now() / 1000;
		return payload.exp < currentTime;
	} catch {
		return true;
	}
}

export function getTokenExpiry(token: string): Date | null {
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return new Date(payload.exp * 1000);
	} catch {
		return null;
	}
}

// Validation utilities
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	if (error && typeof error === 'object' && 'message' in error) {
		return String(error.message);
	}

	return 'An unexpected error occurred';
}

// Async utilities
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
	fn: () => Promise<T>,
	retries: number = 3,
	delayMs: number = 1000
): Promise<T> {
	let lastError: Error;

	for (let i = 0; i <= retries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (i < retries) {
				await delay(delayMs * Math.pow(2, i)); // Exponential backoff
			}
		}
	}

	throw lastError!;
}

// Local storage utilities with error handling
export function safeLocalStorage() {
	if (typeof window === 'undefined') {
		return {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
		};
	}

	return {
		getItem: (key: string) => {
			try {
				return localStorage.getItem(key);
			} catch {
				return null;
			}
		},
		setItem: (key: string, value: string) => {
			try {
				localStorage.setItem(key, value);
			} catch {
				// Silently fail
			}
		},
		removeItem: (key: string) => {
			try {
				localStorage.removeItem(key);
			} catch {
				// Silently fail
			}
		},
	};
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// Constants
export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	CALLBACK: '/callback',
	PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
	HEALTH: '/api/v1/health',
	CSRF_TOKEN: '/api/v1/csrf-token',
	GOOGLE_AUTH: '/api/v1/auth/web/google',
	EXCHANGE_CODE: '/api/v1/auth/web/exchange-code',
	REFRESH: '/api/v1/auth/refresh',
	LOGOUT: '/api/v1/auth/logout',
	PROFILE: '/api/v1/profile',
} as const;
