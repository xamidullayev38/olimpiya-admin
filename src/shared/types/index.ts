// ---------------------------------------------------------------------------
// Domain types — mirrors "3. ASOSIY OBYEKTLAR (ENTITY MODEL)" in the TZ.
// The UI is built against these types now; swapping the mock data layer
// (src/lib/mock-data.ts) for real API calls later shouldn't require
// touching the components.
// ---------------------------------------------------------------------------

export type BadgeStatus = "faol" | "bloklangan" | "muddati_tugagan";

export type AccreditationCode =
  | "ATH"
  | "COACH"
  | "REF"
  | "VOL"
  | "DEL"
  | "MEDIA"
  | "VIP";

export interface AccreditationType {
  code: AccreditationCode;
  name: string;
  color: string; // hex, used as the badge stripe color
  allowedZoneCodes: string[];
  mealAllowed: boolean;
}

export interface Participant {
  id: string;
  fullName: string;
  photoUrl?: string;
  pinfl: string;
  birthDate: string;
  docNumber: string;
  phone: string;
  accreditation: AccreditationCode;
  sport?: string;
  organization: string;
  badgeStatus: BadgeStatus;
  badgeId: string;
  qrToken: string;
  createdAt: string;
}

export type ZoneKind = "kirish_chiqish" | "ochiq";

export interface Zone {
  code: string;
  name: string;
  kind: ZoneKind;
  scanPoints: number;
  currentInside: number;
  capacity?: number;
}

export type MealType = "Nonushta" | "Tushlik" | "Kechki ovqat";

export interface MealWindow {
  day: string; // e.g. "2026-08-14"
  mealType: MealType;
  start: string; // "07:00"
  end: string; // "10:00"
  allowedAccreditations: AccreditationCode[];
}

export type ScanResult = "ruxsat" | "rad";

export interface AccessLogEntry {
  id: string;
  participantId: string;
  participantName: string;
  accreditation: AccreditationCode;
  zoneCode: string;
  direction: "IN" | "OUT";
  timestamp: string;
  result: ScanResult;
  reason?: string;
  device: string;
}

export interface MealLogEntry {
  id: string;
  participantId: string;
  participantName: string;
  accreditation: AccreditationCode;
  mealType: MealType;
  timestamp: string;
  result: ScanResult;
  reason?: string;
  point: string;
}

export interface SystemRole {
  id: string;
  name: string;
  permissions: string[];
  usersCount: number;
  builtIn?: boolean; // default TZ rollari (2-bo'lim) o'chirilmaydi/qayta nomlanmaydi
}

export interface Permission {
  key: string;
  label: string;
  group: string;
}

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  roleIds: string[];
  status: "faol" | "bloklangan";
  lastActive: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string; // system user fullName
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface LiveStat {
  zoneCode: string;
  zoneName: string;
  inside: number;
  capacity?: number;
  inToday: number;
  outToday: number;
}
