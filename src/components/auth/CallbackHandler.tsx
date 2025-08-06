// src/components/auth/CallbackHandler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions } from '@/lib/store/authStore';
import { ROUTES, getErrorMessage } from '@/lib/utils';

export function CallbackHandler() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { handleAuthCallback } = useAuthActions();

	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const processCallback = async () => {
			try {
				console.log('🔥 Processing callback...');
				console.log('Search params:', searchParams.toString());

				// Get auth_code from URL parameters
				const authCode = searchParams.get('auth_code');
				console.log('Auth code:', authCode);

				if (!authCode) {
					throw new Error('No authentication code received');
				}

				console.log('🚀 Exchanging auth code for tokens...');

				// Exchange auth code for tokens
				await handleAuthCallback(authCode);

				console.log('✅ Authentication successful!');
				setStatus('success');

				// Redirect to dashboard after a short delay
				setTimeout(() => {
					const redirectTo = searchParams.get('redirect') || '/dashboard';
					console.log('Redirecting to:', redirectTo);
					router.push(redirectTo);
				}, 2000);

			} catch (err) {
				console.error('❌ Callback processing failed:', err);
				const errorMessage = getErrorMessage(err);
				setError(errorMessage);
				setStatus('error');

				// Redirect to login page with error after delay
				setTimeout(() => {
					router.push(`${ROUTES.LOGIN}?error=callback_failed`);
				}, 3000);
			}
		};

		processCallback();
	}, [searchParams, handleAuthCallback, router]);

	if (status === 'loading') {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
				<div className="animate-spin mx-auto h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				<div className="space-y-2">
					<p className="font-medium">Processing your sign in...</p>
					<p className="text-sm text-gray-600">
						This may take a few seconds
					</p>
				</div>
			</div>
		);
	}

	if (status === 'success') {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
				<div className="mx-auto h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
					<svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<div className="space-y-2">
					<p className="font-medium text-green-600">Sign in successful!</p>
					<p className="text-sm text-gray-600">
						Redirecting you to your dashboard...
					</p>
				</div>
			</div>
		);
	}

	if (status === 'error') {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center space-y-4">
				<div className="mx-auto h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
					<svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>
				<div className="space-y-2">
					<p className="font-medium text-red-600">Sign in failed</p>
					<p className="text-sm text-gray-600">
						{error || 'An unexpected error occurred during sign in'}
					</p>
					<p className="text-xs text-gray-500">
						Redirecting you back to the login page...
					</p>
				</div>

				<button
					onClick={() => router.push(ROUTES.LOGIN)}
					className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
				>
					Try Again
				</button>
			</div>
		);
	}

	return null;
}
