// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-8">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Welcome to your Dashboard!
						</h1>

						<div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-green-800">
										Authentication successful! You are now logged in.
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* User Info */}
							<div className="bg-gray-50 rounded-lg p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
								<div className="space-y-3">
									<div>
										<span className="text-sm font-medium text-gray-500">Name:</span>
										<p className="text-sm text-gray-900">{user.name}</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Email:</span>
										<p className="text-sm text-gray-900">{user.email}</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Google ID:</span>
										<p className="text-sm text-gray-900 font-mono">{user.google_id}</p>
									</div>
									{user.picture && (
										<div>
											<span className="text-sm font-medium text-gray-500">Profile Picture:</span>
											<img
												src={user.picture}
												alt={user.name}
												className="mt-2 h-16 w-16 rounded-full"
											/>
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="bg-blue-50 rounded-lg p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
								<div className="space-y-3">
									<button className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
										View Skills
									</button>
									<button className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
										Set Goals
									</button>
									<button className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
										Track Progress
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
