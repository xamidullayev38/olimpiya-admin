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

function mapBadgeStatus(status?: string): BadgeStatus {
  if (status === "BLOCKED") return "bloklangan";
  if (status === "EXPIRED") return "muddati_tugagan";
  return "faol";
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
    if (data) {
      const stats: LiveStat[] = (data.zoneOccupancy || []).map((z: any) => ({
        zoneCode: z.zoneCode || z.code || "ZONE",
        zoneName: z.zoneName || z.name || "Zona",
        inside: z.currentOccupancy ?? 0,
        inToday: z.inCount ?? z.currentOccupancy ?? 0,
        outToday: z.outCount ?? 0,
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
    // API error or offline
  }

  return {
    liveStats: [],
    totals: { participants: 0, scansToday: 0, deniedToday: 0, mealsToday: 0 },
  };
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
    const list = Array.isArray(data) ? data : data?.data || data?.items || [];
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
  } catch (e) {
    return [];
  }
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
        scanPoints: z.devices?.length || 1,
        currentInside: 0,
        capacity: 500,
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function createZoneApi(data: {
  name: string;
  code: string;
  requiresAccessControl: boolean;
  description?: string;
}): Promise<Zone> {
  const z = await apiClient(ENDPOINTS.ZONES.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    code: z.code,
    name: z.name,
    kind: z.requiresAccessControl ? "kirish_chiqish" : "ochiq",
    scanPoints: 1,
    currentInside: 0,
    capacity: 500,
  };
}

export async function fetchAccreditationTypes(): Promise<AccreditationType[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCREDITATION_TYPES.BASE);
    if (Array.isArray(data)) {
      return data.map((a: any) => ({
        code: a.code as AccreditationCode,
        name: a.name,
        color: a.color || "#2563eb",
        allowedZoneCodes: a.zoneAccess?.map((za: any) => za.zone?.code) || [],
        mealAllowed: Boolean(a.mealAllowed),
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function createAccreditationTypeApi(data: {
  name: string;
  code: string;
  color?: string;
  mealAllowed?: boolean;
}): Promise<AccreditationType> {
  const a = await apiClient(ENDPOINTS.ACCREDITATION_TYPES.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    code: a.code as AccreditationCode,
    name: a.name,
    color: a.color || "#2563eb",
    allowedZoneCodes: [],
    mealAllowed: Boolean(a.mealAllowed),
  };
}

export async function fetchMealSchedule(date?: string): Promise<MealWindow[]> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_SCHEDULE.BASE, { params: { date } });
    if (Array.isArray(data)) {
      return data.map((m: any) => ({
        day: m.date ? m.date.split("T")[0] : new Date().toISOString().split("T")[0],
        mealType: m.mealType === "BREAKFAST" ? "Nonushta" : m.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
        start: m.startTime ? m.startTime.slice(11, 16) : "07:00",
        end: m.endTime ? m.endTime.slice(11, 16) : "10:00",
        allowedAccreditations: m.allowedTypes?.map((at: any) => at.accreditationType?.code) || [],
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function fetchAccessLogs(params?: any): Promise<AccessLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCESS_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      zoneCode: l.zone?.code || "ZONE",
      direction: l.direction || "IN",
      timestamp: l.scannedAt ? l.scannedAt.replace("T", " ").slice(0, 19) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      device: l.deviceId || "SCN",
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchMealLogs(params?: any): Promise<MealLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      mealType: l.mealSchedule?.mealType === "BREAKFAST" ? "Nonushta" : l.mealSchedule?.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
      timestamp: l.scannedAt ? l.scannedAt.replace("T", " ").slice(0, 19) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      point: l.deviceId || "OSHXONA",
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchUsers(): Promise<SystemUser[]> {
  try {
    const data = await apiClient(ENDPOINTS.USERS.BASE);
    if (Array.isArray(data)) {
      return data.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        roleIds: u.roles?.map((r: any) => r.role?.id || r.roleId) || [],
        status: u.isActive ? "faol" : "bloklangan",
        lastActive: u.updatedAt ? u.updatedAt.split("T")[0] : "—",
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function createUserApi(data: {
  fullName: string;
  username: string;
  password?: string;
  roleIds: string[];
}): Promise<SystemUser> {
  const u = await apiClient(ENDPOINTS.USERS.BASE, {
    method: "POST",
    body: JSON.stringify({
      fullName: data.fullName,
      username: data.username,
      password: data.password || "Password123!",
      roleIds: data.roleIds,
    }),
  });
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    roleIds: data.roleIds,
    status: "faol",
    lastActive: new Date().toISOString().split("T")[0],
  };
}

export async function fetchRoles(): Promise<SystemRole[]> {
  try {
    const data = await apiClient(ENDPOINTS.ROLES.BASE);
    if (Array.isArray(data)) {
      return data.map((r: any) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions?.map((p: any) => p.permission?.code || p.permissionId) || [],
        usersCount: r._count?.users || 0,
        builtIn: Boolean(r.isSystem),
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function fetchPermissions(): Promise<Permission[]> {
  try {
    const data = await apiClient(ENDPOINTS.ROLES.PERMISSIONS);
    if (Array.isArray(data)) {
      return data.map((p: any) => ({
        key: p.code,
        label: p.description || p.code,
        group: p.module || "Tizim",
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function createRoleApi(data: { name: string; description?: string }): Promise<SystemRole> {
  const r = await apiClient(ENDPOINTS.ROLES.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    id: r.id,
    name: r.name,
    permissions: [],
    usersCount: 0,
    builtIn: false,
  };
}

export async function assignRolePermissionsApi(roleId: string, permissionIds: string[]): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.ROLES.PERMISSIONS_BY_ID(roleId), {
      method: "POST",
      body: JSON.stringify({ permissionIds }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchAuditLogs(params?: any): Promise<AuditLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.AUDIT_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.map((a: any) => ({
      id: a.id,
      actor: a.user ? a.user.fullName : "Tizim",
      action: a.action,
      target: `${a.entityType || "entity"}:${a.entityId || ""}`,
      timestamp: a.createdAt ? a.createdAt.replace("T", " ").slice(0, 19) : "—",
      details: a.metadata ? JSON.stringify(a.metadata) : undefined,
    }));
  } catch (e) {
    return [];
  }
}
