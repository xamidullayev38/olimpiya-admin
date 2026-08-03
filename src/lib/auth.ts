import { apiClient, storeAuthTokens, clearAuthTokens, getCookie, setCookie, getAccessToken, SESSION_USER_KEY, ACCESS_TOKEN_KEY } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";

export const AUTH_COOKIE = "qr_badge_session";

export interface UserProfile {
  id?: string;
  username: string;
  fullName: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  mustChangePassword?: boolean;
}

export async function loginWithApi(username: string, password?: string) {
  try {
    const response = await apiClient(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        username,
        password: password || "",
      }),
      timeoutMs: 8000,
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
    if (err.status && err.status > 0) {
      return { success: false, error: err.message || "Login yoki parol noto'g'ri" };
    }

    return { success: false, error: err.message || "Tizimga kirishda xatolik yuz berdi" };
  }
}


export function logout() {
  clearAuthTokens();
}

export function getStoredUser(): UserProfile {
  if (typeof document === "undefined") {
    return { username: "guest", fullName: "Mehmon", roles: ["GUEST"] };
  }
  const userJson = getCookie(SESSION_USER_KEY);
  if (userJson) {
    try {
      const parsed = JSON.parse(userJson);
      if (parsed && typeof parsed === "object") {
        return {
          id: parsed.id,
          username: parsed.username || "admin",
          fullName: parsed.fullName || parsed.username || "Super Admin",
          email: parsed.email || "",
          roles: Array.isArray(parsed.roles) ? parsed.roles : ["SUPER_ADMIN"],
          permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ["*"],
        };
      }
    } catch {
      // fallback
    }
  }
  const username = getCookie(AUTH_COOKIE) || "Admin";
  return {
    username,
    fullName: username.toLowerCase().includes("admin") ? "Administrator" : username,
    roles: [username.toLowerCase().includes("admin") ? "SUPER_ADMIN" : "OPERATOR"],
    permissions: ["*"],
  };
}

export function getSessionUser(): string {
  const user = getStoredUser();
  return user.fullName || user.username;
}

export function hasPermission(permissionCode: string): boolean {
  const user = getStoredUser();
  if (user.roles.includes("SUPER_ADMIN") || user.roles.includes("SUPERADMIN")) return true;
  if (user.permissions?.includes("*")) return true;
  return user.permissions?.includes(permissionCode) ?? false;
}

export function hasRole(...roleNames: string[]): boolean {
  const user = getStoredUser();
  if (user.roles.includes("SUPER_ADMIN") || user.roles.includes("SUPERADMIN")) return true;
  return roleNames.some((r) => user.roles.includes(r));
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getAccessToken();
  if (!token) {
    return getStoredUser();
  }
  try {
    const user = await apiClient<UserProfile>(ENDPOINTS.AUTH.ME);
    if (user) {
      setCookie(SESSION_USER_KEY, JSON.stringify(user), 7);
      return user;
    }
  } catch {
    // Return stored user if offline
  }
  return getStoredUser();
}

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(getCookie(AUTH_COOKIE) || getCookie(ACCESS_TOKEN_KEY));
}

