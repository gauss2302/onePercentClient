// src/components/providers/AuthProvider.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const initRef = useRef(false);
	const isInitialized = useAuthStore((state) => state.isInitialized);
	const initializeAuth = useAuthStore((state) => state.initializeAuth);

	useEffect(() => {
		// Prevent double initialization in React StrictMode
		if (initRef.current) return;
		if (isInitialized) return;

		initRef.current = true;

		console.log('🔧 AuthProvider: Initializing auth...');
		initializeAuth().then(() => {
			console.log('✅ AuthProvider: Initialization complete');
		}).catch((error) => {
			console.error('❌ AuthProvider: Initialization failed:', error);
		});
	}, []); // Empty dependency array - run only once

	// Show minimal loading state only during initial load
	if (!isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="inline-flex items-center space-x-2">
						<div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold animate-pulse">
							1%
						</div>
						<span className="text-xl font-bold text-primary">OnePercent</span>
					</div>
					<div className="mt-4">
						<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
