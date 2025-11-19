// src/components/auth/CallbackHandler.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES, getErrorMessage } from "@/lib/utils";
import { AuthResultSchema, validateData } from "@/lib/validations";

export function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing in React StrictMode
    if (processedRef.current) return;

    const processCallback = async () => {
      processedRef.current = true;

      try {
        console.log("🔥 Processing callback...");

        // Get auth_code from URL parameters
        const authCode = searchParams.get("auth_code");
        console.log("Auth code:", authCode);

        if (!authCode) {
          throw new Error("No authentication code received");
        }

        console.log("🚀 Exchanging auth code for tokens...");

        // Exchange auth code for tokens
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(`${apiUrl}/auth/google/callback?code=${authCode}`, {
            method: "GET",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Authentication failed");
        }

        const rawData = await response.json();
        
        // Validate response data using Zod
        const data = validateData(AuthResultSchema, rawData);
        
        const { tokens, user } = data;
        
        setAuth(tokens.access_token, user);

        console.log("✅ Authentication successful!");
        setStatus("success");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          const redirectTo = sessionStorage.getItem("auth_redirect") || ROUTES.DASHBOARD || "/dashboard";
          console.log("Redirecting to:", redirectTo);
          router.push(redirectTo);
          sessionStorage.removeItem("auth_redirect");
        }, 1500);

      } catch (err) {
        console.error("❌ Callback processing failed:", err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setStatus("error");

        // Redirect to login page with error after delay
        setTimeout(() => {
          router.push(`${ROUTES.LOGIN || "/auth/login"}?error=callback_failed`);
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, setAuth, router]);

  if (status === "loading") {
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

  if (status === "success") {
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

  if (status === "error") {
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
            {error || "An unexpected error occurred during sign in"}
          </p>
          <p className="text-xs text-gray-500">
            Redirecting you back to the login page...
          </p>
        </div>

        <button
          onClick={() => router.push(ROUTES.LOGIN || "/auth/login")}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
