// ---------------------------------------------------------------------------
// Mock auth layer. Backend hali tayyor bo'lmagani uchun haqiqiy JWT o'rniga
// oddiy cookie ishlatiladi — shu bilan middleware orqali route himoyasini
// hozirdanoq to'g'ri ishlab ko'rish mumkin. Ulash vaqti kelganda:
//   1. login() ichidagi cookie yozishni  POST /api/auth/login  javobidagi
//      { token } bilan almashtiring (token'ni httpOnly cookie sifatida
//      backend/route handler orqali o'rnatish tavsiya etiladi).
//   2. middleware.ts dagi tekshiruvni token amal qilish muddatini/imzosini
//      tekshiradigan holga keltiring (yoki backendga so'rov yuboring).
// ---------------------------------------------------------------------------

export const AUTH_COOKIE = "qr_badge_session";

export function login(username: string) {
  // 8 soatlik mock sessiya
  const maxAge = 60 * 60 * 8;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
    username
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function logout() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
}

export function getSessionUser(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
