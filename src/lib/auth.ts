import { apiClient, storeAuthTokens, clearAuthTokens, getCookie, setCookie, SESSION_USER_KEY, ACCESS_TOKEN_KEY } from "@/shared/api/client";
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
      timeoutMs: 3500,
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

    // Backend is offline, fallback to local mock login with role based on username
    loginLocal(username);
    return { success: true, isMock: true, error: err.message };
  }
}

export function loginLocal(username: string) {
  const maxAge = 60 * 60 * 24 * 7;
  const lower = username.toLowerCase();
  let role = "OPERATOR";
  let fullName = username;

  if (lower.includes("admin")) {
    role = "SUPER_ADMIN";
    fullName = "Administrator";
  } else if (lower.includes("zone") || lower.includes("menejer")) {
    role = "ZONE_MANAGER";
    fullName = "Zona Menejeri";
  } else if (lower.includes("analyst") || lower.includes("tahlil")) {
    role = "ANALYST";
    fullName = "Tahlilchi";
  } else if (lower.includes("operator")) {
    role = "OPERATOR";
    fullName = "Akkreditatsiya Operatori";
  }

  const mockUser: UserProfile = {
    username,
    fullName,
    roles: [role],
    permissions: role === "SUPER_ADMIN" ? ["*"] : ["participant.create", "badge.print"],
  };

  setCookie(SESSION_USER_KEY, JSON.stringify(mockUser), 7);
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

