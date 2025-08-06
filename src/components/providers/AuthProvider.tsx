// src/components/providers/AuthProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthActions } from '@/lib/store/authStore';

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [isInitialized, setIsInitialized] = useState(false);
	const { initializeAuth } = useAuthActions();

	useEffect(() => {
		const initialize = async () => {
			try {
				await initializeAuth();
			} catch (error) {
				console.error('Auth initialization failed:', error);
			} finally {
				setIsInitialized(true);
			}
		};

		initialize();
	}, [initializeAuth]);

	// Показываем загрузку пока не инициализировалась аутентификация
	if (!isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return <>{children}</>;
};

