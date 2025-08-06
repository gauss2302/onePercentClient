// src/app/auth/login/page.tsx
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Sign In',
	description: 'Sign in to your OnePercent account to continue your growth journey.',
};

export default function LoginPage() {
	return (
		<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
						1%
					</div>
					<h2 className="mt-6 text-3xl font-bold text-foreground">
						Welcome back
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Continue your journey of 1% daily improvement
					</p>
				</div>

				<Suspense fallback={
					<div className="card p-8">
						<div className="animate-pulse space-y-4">
							<div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
							<div className="h-10 bg-muted rounded"></div>
							<div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
						</div>
					</div>
				}>
					<LoginForm />
				</Suspense>

				<div className="text-center">
					<p className="text-xs text-muted-foreground">
						By signing in, you agree to our{' '}
						<a href="/terms" className="underline hover:text-primary transition-colors">
							Terms of Service
						</a>{' '}
						and{' '}
						<a href="/privacy" className="underline hover:text-primary transition-colors">
							Privacy Policy
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
