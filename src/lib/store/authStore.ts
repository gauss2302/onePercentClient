// src/lib/store/authStore.ts
import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import { User, AuthState } from '@/types';
import {UserSchema, validateData} from "@/lib/validaitons";

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
}

type AuthStore = AuthState & AuthActions;

// УБИРАЕМ persist - все данные только в памяти
export const useAuthStore = create<AuthStore>()((set, get) => ({
	// Initial state - все в памяти, НЕТ localStorage
	user: null,
	tokens: null, // Не используется
	isAuthenticated: false,
	isLoading: false,
	error: null,

	// Actions
	login: async () => {
		try {
			set({ isLoading: true, error: null });

			const authUrl = await apiClient.getGoogleAuthUrl();

			// Redirect to Google OAuth
			if (typeof window !== 'undefined') {
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

			const result = await apiClient.exchangeAuthCode(authCode);

			// Validate the response
			const validatedUser = validateData(UserSchema, result.user);

			set({
				user: validatedUser,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});
		} catch (error) {
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
		} catch (error) {
			console.error('Logout error:', error);
			// Continue with logout even if API call fails
		} finally {
			// Clear all state
			set({
				user: null,
				tokens: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
			});

			// Redirect to login page
			if (typeof window !== 'undefined') {
				window.location.href = '/auth/login';
			}
		}
	},

	// Initialize auth on app start - check for existing session
	initializeAuth: async () => {
		try {
			set({ isLoading: true });

			console.log('🚀 Initializing authentication...');

			const session = await apiClient.checkSession();

			if (session) {
				console.log('✅ Valid session found');
				const validatedUser = validateData(UserSchema, session.user);
				set({
					user: validatedUser,
					isAuthenticated: true,
					isLoading: false,
					error: null,
				});
			} else {
				console.log('❌ No valid session found');
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
				});
			}
		} catch (error) {
			console.error('Auth initialization failed:', error);
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
			});
		}
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
}));

// Utility hooks
export const useAuth = () => {
	const store = useAuthStore();
	return {
		user: store.user,
		isAuthenticated: store.isAuthenticated,
		isLoading: store.isLoading,
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
