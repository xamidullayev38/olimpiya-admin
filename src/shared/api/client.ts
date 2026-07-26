import { API_BASE_URL, ENDPOINTS } from "./endpoints";

export const ACCESS_TOKEN_KEY = "qr_badge_access_token";
export const REFRESH_TOKEN_KEY = "qr_badge_refresh_token";
export const SESSION_USER_KEY = "qr_badge_session_user";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function storeAuthTokens(accessToken: string, refreshToken: string, user: any) {
  setCookie(ACCESS_TOKEN_KEY, accessToken, 1);
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
  setCookie(SESSION_USER_KEY, JSON.stringify(user), 7);
}

export function clearAuthTokens() {
  eraseCookie(ACCESS_TOKEN_KEY);
  eraseCookie(REFRESH_TOKEN_KEY);
  eraseCookie(SESSION_USER_KEY);
  eraseCookie("qr_badge_session");
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  isRetry?: boolean;
  timeoutMs?: number;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, isRetry = false, timeoutMs = 3500, headers: customHeaders, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (!(customConfig.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.status === 401 && !isRetry && !endpoint.includes("/auth/")) {
      // Refresh token attempt
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.accessToken) {
              setCookie(ACCESS_TOKEN_KEY, data.accessToken, 1);
              if (data.refreshToken) {
                setCookie(REFRESH_TOKEN_KEY, data.refreshToken, 7);
              }
              // Retry original request
              return apiClient<T>(endpoint, { ...options, isRetry: true });
            }
          }
        } catch {
          // Token refresh failed
        }
      }
      clearAuthTokens();
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      const message =
        errorData?.message ||
        (Array.isArray(errorData?.message) ? errorData.message.join(", ") : null) ||
        `HTTP Error ${response.status}`;
      throw new ApiError(message, response.status, errorData);
    }

    // Check if response is file download or json
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.blob()) as unknown as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === "AbortError") {
      throw new ApiError("Serverdan javob kutish vaqti tugadi (Timeout)", 0);
    }
    throw new ApiError(err.message || "Tarmoq xatosi yoki server ishlamayapti", 0);
  }
}
