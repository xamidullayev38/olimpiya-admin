export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://olimpiya.saidly.me/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    CHANGE_PASSWORD: "/auth/change-password",
    ME: "/auth/me",
  },
  DASHBOARD: {
    LIVE_STATS: "/dashboard/live-stats",
  },
  PARTICIPANTS: {
    BASE: "/participants",
    BY_ID: (id: string) => `/participants/${id}`,
    HISTORY: (id: string) => `/participants/${id}/history`,
    IMPORT: "/participants/import",
    BLOCK: (id: string) => `/participants/${id}/block`,
    UNBLOCK: (id: string) => `/participants/${id}/unblock`,
  },
  BADGES: {
    QR: (id: string) => `/badges/${id}/qr`,
    REISSUE: (id: string) => `/badges/${id}/reissue`,
    PRINT: "/badges/print",
  },
  ZONES: {
    BASE: "/zones",
    BY_ID: (id: string) => `/zones/${id}`,
    OCCUPANCY: (id: string) => `/zones/${id}/occupancy`,
    DEACTIVATE: (id: string) => `/zones/${id}/deactivate`,
  },
  ACCREDITATION_TYPES: {
    BASE: "/accreditation-types",
    BY_ID: (id: string) => `/accreditation-types/${id}`,
    ZONES: (id: string) => `/accreditation-types/${id}/zones`,
    DEACTIVATE: (id: string) => `/accreditation-types/${id}/deactivate`,
  },
  MEAL_SCHEDULE: {
    BASE: "/meal-schedule",
    BY_ID: (id: string) => `/meal-schedule/${id}`,
    DEACTIVATE: (id: string) => `/meal-schedule/${id}/deactivate`,
  },
  MEAL_LOGS: {
    BASE: "/meal-logs",
    DAILY_STATS: "/meal-logs/daily-stats",
    EXPORT: "/meal-logs/export/excel",
  },
  ACCESS_LOGS: {
    BASE: "/access-logs",
    DENIED: "/access-logs/denied",
    EXPORT: "/access-logs/export/excel",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
  },
  ROLES: {
    BASE: "/roles",
    PERMISSIONS: "/roles/permissions",
    PERMISSIONS_BY_ID: (id: string) => `/roles/${id}/permissions`,
    BY_ID: (id: string) => `/roles/${id}`,
  },
  AUDIT_LOGS: {
    BASE: "/audit-logs",
  },
};
