// src/lib/store/authStore.ts
import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import { User, AuthState } from '@/types';
import { UserSchema, validateData } from "@/lib/validaitons";
import {cookies} from "next/headers";
import { NextResponse } from 'next/server';

interface AuthActions {
	// Actions
	login: () => Promise<void>;
	handleAuthCallback: (authCode: string) => Promise<void>;
	logout: () => Promise<void>;
	initializeAuth: () => Promise<void>;
	updateProfile: (data: { name: string; picture?: string }) => Promise<void>;
	clearError: () => void;

	// State setters
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setUser: (user: User | null) => void;
	setAuthenticated: (authenticated: boolean) => void;
	setInitialized: (initialized: boolean) => void;
}

type AuthStore = AuthState & {
	isInitialized: boolean;
	initializationPromise: Promise<void> | null;
} & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
	// Initial state
	user: null,
	tokens: null, // Not used in frontend
	isAuthenticated: false,
	isLoading: false,
	isInitialized: false,
	initializationPromise: null,
	error: null,

	// Actions
	login: async () => {
		try {
			set({ isLoading: true, error: null });

			const authUrl = await apiClient.getGoogleAuthUrl();

			// Store the current URL to redirect back after auth
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath !== '/auth/login' && currentPath !== '/') {
					sessionStorage.setItem('auth_redirect', currentPath);
				}

				window.location.href = authUrl;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Login failed';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	handleAuthCallback: async (authCode: string) => {
		try {
			set({ isLoading: true, error: null });

			console.log('🔄 Exchanging auth code for session...');

			const result = await apiClient.exchangeAuthCode(authCode);

			// Validate the response
			const validatedUser = validateData(UserSchema, result.user);

			console.log('✅ Authentication successful');

			set({
				user: validatedUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			// Check for stored redirect path
			const redirectPath = sessionStorage.getItem('auth_redirect');
			if (redirectPath) {
				sessionStorage.removeItem('auth_redirect');
				window.location.href = redirectPath;
			}
		} catch (error) {
			console.error('❌ Authentication callback failed:', error);
			const errorMessage = error instanceof Error ? error.message : 'Authentication callback failed';
			set({
				error: errorMessage,
				isLoading: false,
				user: null,
				isAuthenticated: false,
			});
			throw error;
		}
	},

	logout: async () => {
		try {
			set({ isLoading: true });

			await apiClient.logout();

			console.log('✅ Logout successful');
		} catch (error) {
			console.error('⚠️ Logout API error (continuing with local cleanup):', error);
		} finally {
			// Always clear local state
			set({
				user: null,
				tokens: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
			});

			// Redirect to home page
			if (typeof window !== 'undefined') {
				window.location.href = '/';
			}
		}
	},

	// Initialize auth on app start - with singleton promise
	initializeAuth: async () => {
		const state = get();

		// If already initialized, return immediately
		if (state.isInitialized) {
			console.log('⏭️ Auth already initialized');
			return;
		}

		// If initialization is in progress, wait for it
		if (state.initializationPromise) {
			console.log('⏳ Auth initialization already in progress, waiting...');
			return state.initializationPromise;
		}

		// Create a new initialization promise
		const initPromise = (async () => {
			try {
				set({ isLoading: true });

				console.log('🚀 Starting auth initialization...');

				// Check if we have a valid session (HttpOnly cookies)
				const session = await apiClient.checkSession();

				if (session && session.user) {
					console.log('✅ Valid session found');
					const validatedUser = validateData(UserSchema, session.user);

					set({
						user: validatedUser,
						isAuthenticated: true,
						isLoading: false,
						isInitialized: true,
						initializationPromise: null,
						error: null,
					});
				} else {
					console.log('ℹ️ No active session');
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						isInitialized: true,
						initializationPromise: null,
						error: null,
					});
				}
			} catch (error) {
				console.error('⚠️ Auth initialization error:', error);
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					isInitialized: true,
					initializationPromise: null,
					error: null,
				});
			}
		})();

		// Store the promise to prevent concurrent initialization
		set({ initializationPromise: initPromise });

		return initPromise;
	},

	updateProfile: async (data: { name: string; picture?: string }) => {
		try {
			set({ isLoading: true, error: null });

			const updatedUser = await apiClient.updateProfile(data);
			const validatedUser = validateData(UserSchema, updatedUser);

			set({
				user: validatedUser,
				isLoading: false,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// State setters
	clearError: () => set({ error: null }),
	setLoading: (loading: boolean) => set({ isLoading: loading }),
	setError: (error: string | null) => set({ error }),
	setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
	setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
	setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
}));

// Set up global auth event listener
if (typeof window !== 'undefined') {
	window.addEventListener('auth:logout', () => {
		console.log('🚪 Received auth:logout event');
		const store = useAuthStore.getState();

		// Only logout if not already logging out
		if (!store.isLoading) {
			store.logout();
		}
	});
}

// Utility hooks
export const useAuth = () => {
	const store = useAuthStore();
	return {
		user: store.user,
		isAuthenticated: store.isAuthenticated,
		isLoading: store.isLoading,
		isInitialized: store.isInitialized,
		error: store.error,
	};
};

export const useAuthActions = () => {
	const store = useAuthStore();
	return {
		login: store.login,
		logout: store.logout,
		handleAuthCallback: store.handleAuthCallback,
		initializeAuth: store.initializeAuth,
		updateProfile: store.updateProfile,
		clearError: store.clearError,
	};
};
