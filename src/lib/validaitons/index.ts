// src/lib/validations/index.ts
import { z } from 'zod';

// User validation schema
export const UserSchema = z.object({
	id: z.string().uuid(),
	google_id: z.string(),
	email: z.string().email(),
	name: z.string().min(1, 'Name is required'),
	picture: z.string().url().optional(), // Убираем .or(z.literal(''))
	created_at: z.string(),
	updated_at: z.string(),
});

// Token pair validation schema
export const TokenPairSchema = z.object({
	access_token: z.string().min(1, 'Access token is required'),
	refresh_token: z.string().min(1, 'Refresh token is required'),
});

// Auth result validation schema
export const AuthResultSchema = z.object({
	user: UserSchema,
	tokens: TokenPairSchema,
});

// API response validation schemas
export const GoogleAuthResponseSchema = z.object({
	auth_url: z.string().url(),
});

export const CSRFResponseSchema = z.object({
	csrf_token: z.string().min(1),
});

export const ApiErrorSchema = z.object({
	error: z.string(),
	details: z.string().optional(),
});

// Form validation schemas
export const LoginFormSchema = z.object({
	email: z.string().email('Please enter a valid email').optional(),
});

export const ProfileFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
	picture: z.string().url('Please enter a valid URL').optional(),
});

// Environment validation
export const EnvSchema = z.object({
	BACKEND_URL: z.string().url(),
	NEXT_PUBLIC_BACKEND_URL: z.string().url(),
});

// Utility function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
	try {
		return schema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(`Validation error: ${error.issues.map(e => e.message).join(', ')}`);
		}
		throw error;
	}
}

// Type inference helpers
export type UserType = z.infer<typeof UserSchema>;
export type TokenPairType = z.infer<typeof TokenPairSchema>;
export type AuthResultType = z.infer<typeof AuthResultSchema>;
export type LoginFormType = z.infer<typeof LoginFormSchema>;
export type ProfileFormType = z.infer<typeof ProfileFormSchema>;
