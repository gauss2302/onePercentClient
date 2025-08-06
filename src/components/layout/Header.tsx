// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useAuthActions } from '@/lib/store/authStore';
import { cn, ROUTES } from '@/lib/utils';
import { useState } from 'react';

export function Header() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const { logout } = useAuthActions();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link
							href={ROUTES.HOME}
							className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
						>
							<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
								1%
							</div>
							<span>OnePercent</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-6">
						<Link
							href={ROUTES.HOME}
							className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
						>
							Home
						</Link>

						{isAuthenticated && (
							<>
								<Link
									href="/dashboard"
									className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
								>
									Dashboard
								</Link>
								<Link
									href="/skills"
									className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
								>
									Skills
								</Link>
							</>
						)}
					</nav>

					{/* User Menu */}
					<div className="flex items-center space-x-4">
						{isLoading ? (
							<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
						) : isAuthenticated && user ? (
							<div className="relative">
								<button
									onClick={() => setIsMenuOpen(!isMenuOpen)}
									className="flex items-center space-x-2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 transition-colors"
								>
									{user.picture ? (
										<Image
											src={user.picture}
											alt={user.name}
											width={32}
											height={32}
											className="rounded-full"
										/>
									) : (
										<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
											{user.name.charAt(0).toUpperCase()}
										</div>
									)}
									<span className="hidden sm:block text-sm font-medium">
                    {user.name}
                  </span>
									<svg
										className={cn(
											"h-4 w-4 transition-transform",
											isMenuOpen && "rotate-180"
										)}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>

								{/* Dropdown Menu */}
								{isMenuOpen && (
									<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-200">
										<div className="py-1">
											<div className="px-4 py-2 text-sm border-b border-gray-200">
												<p className="font-medium">{user.name}</p>
												<p className="text-gray-600">{user.email}</p>
											</div>

											<Link
												href="/profile"
												className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
												onClick={() => setIsMenuOpen(false)}
											>
												Profile
											</Link>

											<Link
												href="/settings"
												className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
												onClick={() => setIsMenuOpen(false)}
											>
												Settings
											</Link>

											<hr className="my-1 border-gray-200" />

											<button
												onClick={handleLogout}
												className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
											>
												Sign Out
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<Link
									href={ROUTES.LOGIN}
									className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 h-9 px-4 py-2"
								>
									Sign In
								</Link>
							</div>
						)}

						{/* Mobile menu button */}
						<button
							className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{isMenuOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
							<Link
								href={ROUTES.HOME}
								className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								Home
							</Link>

							{isAuthenticated && (
								<>
									<Link
										href="/dashboard"
										className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
										onClick={() => setIsMenuOpen(false)}
									>
										Dashboard
									</Link>
									<Link
										href="/skills"
										className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
										onClick={() => setIsMenuOpen(false)}
									>
										Skills
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
