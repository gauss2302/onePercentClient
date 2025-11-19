"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useEffect, useRef } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, setAccessToken, logout } = useAuthStore();
  const isRefreshing = useRef(false);

  useEffect(() => {
    if (user && !accessToken && !isRefreshing.current) {
      isRefreshing.current = true;

      const restore = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.tokens.accessToken);
          } else {
            logout();
          }
        } catch {
          logout();
        } finally {
          isRefreshing.current = false;
        }
      };
    }
  }, [user, accessToken, setAccessToken, logout]);

  return <>{children}</>;
}
