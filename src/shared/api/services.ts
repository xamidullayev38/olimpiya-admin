import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import {
  Participant,
  Zone,
  AccreditationType,
  MealWindow,
  AccessLogEntry,
  MealLogEntry,
  LiveStat,
  SystemUser,
  SystemRole,
  Permission,
  AuditLogEntry,
  BadgeStatus,
  AccreditationCode,
} from "../types";
import {
  participants as mockParticipants,
  zones as mockZones,
  accreditationTypes as mockAccTypes,
  mealSchedule as mockMealSchedule,
  accessLogs as mockAccessLogs,
  mealLogs as mockMealLogs,
  liveStats as mockLiveStats,
  systemUsers as mockSystemUsers,
  roles as mockSystemRoles,
  permissionCatalog as mockAllPermissions,
  auditLog as mockAuditLogs,
} from "./mock-data";

function mapBadgeStatus(status?: string): BadgeStatus {
  if (status === "BLOCKED") return "bloklangan";
  if (status === "EXPIRED") return "muddati_tugagan";
  return "faol";
}

function unmapBadgeStatus(status?: BadgeStatus): string {
  if (status === "bloklangan") return "BLOCKED";
  if (status === "muddati_tugagan") return "EXPIRED";
  return "ACTIVE";
}

export async function fetchLiveStats(): Promise<{
  liveStats: LiveStat[];
  totals: {
    participants: number;
    scansToday: number;
    deniedToday: number;
    mealsToday: number;
  };
}> {
  try {
    const data = await apiClient(ENDPOINTS.DASHBOARD.LIVE_STATS);
    if (data && data.zoneOccupancy) {
      const stats: LiveStat[] = data.zoneOccupancy.map((z: any) => ({
        zoneCode: z.zoneCode,
        zoneName: z.zoneName,
        inside: z.currentOccupancy,
        inToday: z.currentOccupancy,
        outToday: 0,
      }));
      return {
        liveStats: stats,
        totals: {
          participants: data.totalParticipants || 0,
          scansToday: data.totalScansToday || 0,
          deniedToday: data.deniedToday || 0,
          mealsToday: data.mealsServedToday || 0,
        },
      };
    }
  } catch (e) {
    // Fallback to mock
  }

  const totals = {
    participants: mockParticipants.filter((p) => p.badgeStatus === "faol").length,
    scansToday: mockAccessLogs.length,
    deniedToday: mockAccessLogs.filter((l) => l.result === "rad").length,
    mealsToday: mockMealLogs.length,
  };
  return { liveStats: mockLiveStats, totals };
}

export async function fetchParticipants(params?: {
  search?: string;
  accreditation?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Participant[]> {
  try {
    const data = await apiClient(ENDPOINTS.PARTICIPANTS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || data?.items;
    if (list) {
      return list.map((item: any) => ({
        id: item.id,
        fullName: `${item.firstName} ${item.lastName}` + (item.middleName ? ` ${item.middleName}` : ""),
        pinfl: item.pinflLast4 ? `***${item.pinflLast4}` : item.pinflEncrypted || "—",
        birthDate: item.birthDate ? item.birthDate.split("T")[0] : "—",
        docNumber: item.documentNumber || "—",
        phone: item.phone || "—",
        accreditation: (item.accreditationType?.code || "ATH") as AccreditationCode,
        sport: item.sportType,
        organization: item.organization || "—",
        badgeStatus: mapBadgeStatus(item.badgeStatus),
        badgeId: `BADGE-${item.id.slice(0, 6).toUpperCase()}`,
        qrToken: item.qrTokenId || `qr_${item.id}`,
        createdAt: item.createdAt ? item.createdAt.split("T")[0] : "—",
      }));
    }
  } catch (e) {
    // Fallback to mock
  }

  let filtered = [...mockParticipants];
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.docNumber.toLowerCase().includes(q) ||
        p.pinfl.includes(q)
    );
  }
  if (params?.accreditation && params.accreditation !== "ALL") {
    filtered = filtered.filter((p) => p.accreditation === params.accreditation);
  }
  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((p) => p.badgeStatus === params.status);
  }
  return filtered;
}

export async function createParticipantApi(data: {
  firstName: string;
  lastName: string;
  middleName?: string;
  pinfl?: string;
  documentNumber?: string;
  phone?: string;
  organization?: string;
  sportType?: string;
  accreditationTypeId: string;
}): Promise<Participant> {
  try {
    const res = await apiClient(ENDPOINTS.PARTICIPANTS.BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return {
      id: res.id,
      fullName: `${res.firstName} ${res.lastName}`,
      pinfl: res.pinflLast4 || data.pinfl || "—",
      birthDate: res.birthDate ? res.birthDate.split("T")[0] : "2000-01-01",
      docNumber: res.documentNumber || data.documentNumber || "—",
      phone: res.phone || data.phone || "—",
      accreditation: (res.accreditationType?.code || "ATH") as AccreditationCode,
      sport: res.sportType || data.sportType,
      organization: res.organization || data.organization || "—",
      badgeStatus: mapBadgeStatus(res.badgeStatus),
      badgeId: `BADGE-${res.id.slice(0, 6).toUpperCase()}`,
      qrToken: res.qrTokenId || `qr_${res.id}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
  } catch (e: any) {
    throw new Error(e.message || "Ishtirokchini saqlashda xatolik");
  }
}

export async function blockParticipantApi(id: string): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.PARTICIPANTS.BLOCK(id), { method: "POST" });
    return true;
  } catch (e) {
    return false;
  }
}

export async function unblockParticipantApi(id: string): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.PARTICIPANTS.UNBLOCK(id), { method: "POST" });
    return true;
  } catch (e) {
    return false;
  }
}

export async function reissueBadgeApi(id: string): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.BADGES.REISSUE(id), { method: "POST" });
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchZones(): Promise<Zone[]> {
  try {
    const data = await apiClient(ENDPOINTS.ZONES.BASE);
    if (Array.isArray(data)) {
      return data.map((z: any) => ({
        code: z.code,
        name: z.name,
        kind: z.requiresAccessControl ? "kirish_chiqish" : "ochiq",
        scanPoints: z.devices?.length || 2,
        currentInside: 0,
        capacity: 500,
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockZones;
}

export async function fetchAccreditationTypes(): Promise<AccreditationType[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCREDITATION_TYPES.BASE);
    if (Array.isArray(data)) {
      return data.map((a: any) => ({
        code: a.code as AccreditationCode,
        name: a.name,
        color: a.color || "#2563eb",
        allowedZoneCodes: a.zoneAccess?.map((za: any) => za.zone?.code) || ["FOP", "MPC"],
        mealAllowed: a.mealAllowed,
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockAccTypes;
}

export async function fetchMealSchedule(date?: string): Promise<MealWindow[]> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_SCHEDULE.BASE, { params: { date } });
    if (Array.isArray(data)) {
      return data.map((m: any) => ({
        day: m.date ? m.date.split("T")[0] : "2026-08-14",
        mealType: m.mealType === "BREAKFAST" ? "Nonushta" : m.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
        start: m.startTime ? m.startTime.slice(11, 16) : "07:00",
        end: m.endTime ? m.endTime.slice(11, 16) : "10:00",
        allowedAccreditations: m.allowedTypes?.map((at: any) => at.accreditationType?.code) || ["ATH", "COACH"],
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockMealSchedule;
}

export async function fetchAccessLogs(params?: any): Promise<AccessLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCESS_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data;
    if (list) {
      return list.map((l: any) => ({
        id: l.id,
        participantId: l.participantId || "P-00",
        participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
        accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
        zoneCode: l.zone?.code || "FOP",
        direction: l.direction || "IN",
        timestamp: l.scannedAt ? l.scannedAt.replace("T", " ").slice(0, 19) : "2026-08-14 10:00:00",
        result: l.result === "GRANTED" ? "ruxsat" : "rad",
        reason: l.denyReason,
        device: l.deviceId || "SCN-1",
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockAccessLogs;
}

export async function fetchMealLogs(params?: any): Promise<MealLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data;
    if (list) {
      return list.map((l: any) => ({
        id: l.id,
        participantId: l.participantId || "P-00",
        participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
        accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
        mealType: l.mealSchedule?.mealType === "BREAKFAST" ? "Nonushta" : l.mealSchedule?.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
        timestamp: l.scannedAt ? l.scannedAt.replace("T", " ").slice(0, 19) : "2026-08-14 12:30:00",
        result: l.result === "GRANTED" ? "ruxsat" : "rad",
        reason: l.denyReason,
        point: l.deviceId || "OSHXONA-1",
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockMealLogs;
}

export async function fetchUsers(): Promise<SystemUser[]> {
  try {
    const data = await apiClient(ENDPOINTS.USERS.BASE);
    if (Array.isArray(data)) {
      return data.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        roleIds: u.roles?.map((r: any) => r.role?.id || r.roleId) || ["r1"],
        status: u.isActive ? "faol" : "bloklangan",
        lastActive: u.updatedAt ? u.updatedAt.split("T")[0] : "—",
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockSystemUsers;
}

export async function fetchRoles(): Promise<SystemRole[]> {
  try {
    const data = await apiClient(ENDPOINTS.ROLES.BASE);
    if (Array.isArray(data)) {
      return data.map((r: any) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions?.map((p: any) => p.permission?.code) || [],
        usersCount: r._count?.users || 1,
        builtIn: r.isSystem,
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockSystemRoles;
}

export async function fetchAuditLogs(params?: any): Promise<AuditLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.AUDIT_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data;
    if (list) {
      return list.map((a: any) => ({
        id: a.id,
        actor: a.user ? a.user.fullName : "Tizim",
        action: a.action,
        target: `${a.entityType || "entity"}:${a.entityId || ""}`,
        timestamp: a.createdAt ? a.createdAt.replace("T", " ").slice(0, 19) : "—",
        details: JSON.stringify(a.metadata || {}),
      }));
    }
  } catch (e) {
    // Fallback
  }
  return mockAuditLogs;
}
