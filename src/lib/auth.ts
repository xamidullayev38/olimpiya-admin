import { apiClient, storeAuthTokens, clearAuthTokens, getCookie, SESSION_USER_KEY, ACCESS_TOKEN_KEY } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";

export const AUTH_COOKIE = "qr_badge_session";

export async function loginWithApi(username: string, password?: string) {
  try {
    const response = await apiClient(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        username,
        password: password || "operator123",
      }),
      timeoutMs: 3000, // 3-second fast timeout
    });

    if (response && response.accessToken) {
      storeAuthTokens(response.accessToken, response.refreshToken, response.user);
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
        response.user?.username || username
      )}; path=/; max-age=${maxAge}; SameSite=Lax`;
      return { success: true, user: response.user };
    }
    return { success: false, error: "Token olinmadi" };
  } catch (err: any) {
    // If backend returned HTTP 401 / 403 / 400, show real invalid credentials error!
    if (err.status && err.status > 0) {
      return { success: false, error: err.message || "Login yoki parol noto'g'ri" };
    }

    // ONLY if backend is completely offline/unreachable (status 0), fallback to local demo mode
    loginLocal(username);
    return { success: true, isMock: true, error: err.message };
  }
}

export function loginLocal(username: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
    username
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function login(username: string) {
  loginLocal(username);
}

export function logout() {
  clearAuthTokens();
}

export function getSessionUser(): string | null {
  if (typeof document === "undefined") return null;
  const userJson = getCookie(SESSION_USER_KEY);
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.fullName || user.username;
    } catch {
      // fallback
    }
  }
  const match = document.cookie.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(getCookie(AUTH_COOKIE) || getCookie(ACCESS_TOKEN_KEY));
}
