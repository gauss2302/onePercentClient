import React, {useEffect, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {useAuthActions, useAuth} from "@/lib/store/authStore";

interface ProtectedRouteProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	fallback,
	redirectTo = "/auth/login",
							   }: ProtectedRouteProps) {

	const router = useRouter();
	const pathname = usePathname();
	const {isInitialized, isAuthenticated, isLoading} = useAuth();
	const {checkAuth} = useAuthActions();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(()=>{
		const verifyAuth = async () => {
			if(!isInitialized) {
				return;
			}

			if(!isAuthenticated) {
				setIsChecking(true);
				const isValid = await checkAuth();

				if(!isValid) {
					sessionStorage.setItem("auth_redirect", pathname);
					router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
				}
				setIsChecking(false);
			} else {
				setIsChecking(false);
			}
		};

		verifyAuth();
	}, [isAuthenticated, isInitialized, pathname, router, redirectTo, checkAuth]);

	if(!isInitialized || isLoading || isChecking) {
		return fallback || (
			<div className={"min-h-screen items-center justify-between"}>
				<div className={"text-center"}>
					<div
						className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-sm text-muted-foreground">Verifying authentication...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
