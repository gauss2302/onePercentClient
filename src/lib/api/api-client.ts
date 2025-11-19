import { useAuthStore } from "../store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAuthToken();

      if (newAccessToken) {
        config.headers = {
          Authorization: `Bearer ${newAccessToken}`,
        } as HeadersInit;

        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      }
    } catch (error) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      throw error;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Request failed");
  }

  return response.json();
}

async function refreshAuthToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Refresh failed");

    const data = await response.json();
    const newAccessToken = data.tokens.access_token;

    useAuthStore.getState().setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
