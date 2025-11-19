import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = ROUTES.LOGIN || "/auth/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      sessionStorage.setItem("auth_redirect", pathname);
      router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isMounted, pathname, router, redirectTo]);

  // Show fallback or nothing while mounting or checking auth
  if (!isMounted || !user) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Verifying authentication...
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
