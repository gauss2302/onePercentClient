// src/app/auth/callback/page.tsx
import { Metadata } from 'next';
import { CallbackHandler } from '@/components/auth/CallbackHandler';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Completing Sign In',
	description: 'Completing your sign in process...',
};

export default function CallbackPage() {
	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<div className="mx-auto h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
						1%
					</div>
					<h2 className="mt-6 text-2xl font-bold">
						Completing Sign In
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Please wait while we set up your account...
					</p>
				</div>

				<Suspense
					fallback={
						<div className="bg-white shadow rounded-lg p-8 text-center">
							<div className="animate-spin mx-auto h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
							<p className="text-sm text-gray-600">Loading...</p>
						</div>
					}
				>
					<CallbackHandler />
				</Suspense>
			</div>
		</div>
	);
}
