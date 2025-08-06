// src/types/index.ts
import React from "react";

export interface User {
	id: string;
	google_id: string;
	email: string;
	name: string;
	picture?: string;
	created_at: string;
	updated_at: string;
}

export interface TokenPair {
	access_token: string;
	refresh_token: string;
}

export interface AuthResult {
	user: User;
	tokens: TokenPair;
}

export interface GoogleAuthResponse {
	auth_url: string;
}

export interface CSRFResponse {
	csrf_token: string;
}

export interface ApiError {
	error: string;
	details?: string;
}

export interface AuthState {
	user: User | null;
	tokens: TokenPair | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
}

// Navigation types
export interface NavItem {
	label: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

// Form types
export interface LoginFormData {
	email?: string;
}

export interface ProfileFormData {
	name: string;
	picture?: string;
}
