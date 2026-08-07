import { apiClient, getAccessToken } from "./client";
import { ENDPOINTS, API_BASE_URL } from "./endpoints";
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

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString.replace("T", " ").slice(0, 19);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return dateString;
  }
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
      qrToken: item.qrToken || item.qrTokenId || `qr_${item.id}`,
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
    qrToken: res.qrToken || res.qrTokenId || `qr_${res.id}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
}

export async function updateParticipantApi(id: string, data: Partial<{
  firstName: string;
  lastName: string;
  middleName: string;
  pinfl: string;
  documentNumber: string;
  phone: string;
  organization: string;
  sportType: string;
  accreditationTypeId: string;
}>): Promise<Participant> {
  const res = await apiClient(`${ENDPOINTS.PARTICIPANTS.BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return {
    id: res.id,
    fullName: `${res.firstName} ${res.lastName}` + (res.middleName ? ` ${res.middleName}` : ""),
    pinfl: res.pinflLast4 || data.pinfl || "—",
    birthDate: res.birthDate ? res.birthDate.split("T")[0] : "2000-01-01",
    docNumber: res.documentNumber || data.documentNumber || "—",
    phone: res.phone || data.phone || "—",
    accreditation: (res.accreditationType?.code || "ATH") as AccreditationCode,
    sport: res.sportType || data.sportType,
    organization: res.organization || data.organization || "—",
    badgeStatus: mapBadgeStatus(res.badgeStatus),
    badgeId: `BADGE-${res.id.slice(0, 6).toUpperCase()}`,
    qrToken: res.qrToken || `qr_${res.id}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
}

export async function importParticipantsApi(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.PARTICIPANTS.IMPORT}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Faylni import qilishda xatolik yuz berdi");
  }

  return res.json();
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
        id: z.id,
        code: z.code,
        name: z.name,
        kind: z.requiresAccessControl ? "kirish_chiqish" : "ochiq",
        scanPoints: z.devices?.length || 1,
        currentInside: 0,
        capacity: z.description && z.description.includes("Sig'imi: ") ? parseInt(z.description.split("Sig'imi: ")[1]) : undefined,
        isAllAllowed: z.accessRules ? z.accessRules.length === 0 : true,
        devices: z.devices ? z.devices.map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status === "ACTIVE" ? "faol" : "bekor_qilingan",
          zoneId: z.id,
          zoneName: z.name,
          lastSeenAt: d.lastSeenAt ? formatDateTime(d.lastSeenAt) : "—",
        })) : [],
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
  allowedAccreditationTypeIds?: string[];
}): Promise<Zone> {
  const z = await apiClient(ENDPOINTS.ZONES.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    id: z.id,
    code: z.code,
    name: z.name,
    kind: z.requiresAccessControl ? "kirish_chiqish" : "ochiq",
    scanPoints: 1,
    currentInside: 0,
    capacity: (z.description || data.description) && (z.description || data.description).includes("Sig'imi: ") ? parseInt((z.description || data.description).split("Sig'imi: ")[1]) : undefined,
  };
}

export async function updateZoneApi(id: string, data: {
  name?: string;
  code?: string;
  requiresAccessControl?: boolean;
  description?: string;
  allowedAccreditationTypeIds?: string[];
}): Promise<Zone> {
  const z = await apiClient(`${ENDPOINTS.ZONES.BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return {
    id: z.id,
    code: z.code,
    name: z.name,
    kind: z.requiresAccessControl ? "kirish_chiqish" : "ochiq",
    scanPoints: z.devices?.length || 1,
    currentInside: 0,
    capacity: z.description && z.description.includes("Sig'imi: ") ? parseInt(z.description.split("Sig'imi: ")[1]) : undefined,
  };
}

export async function fetchAccreditationTypes(): Promise<AccreditationType[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCREDITATION_TYPES.BASE);
    if (Array.isArray(data)) {
      return data.map((a: any) => ({
        id: a.id,
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
    id: a.id,
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
    const list = Array.isArray(data) ? data : data?.data || data?.items || [];
    return list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      zoneCode: l.zone?.code || "ZONE",
      direction: l.direction || "IN",
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      device: l.device?.name || l.deviceId || "SCN",
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchAccessLogsPaginated(params?: any): Promise<{ items: AccessLogEntry[], total: number }> {
  try {
    const data = await apiClient(ENDPOINTS.ACCESS_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.items || data?.data || [];
    const items = list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      zoneCode: l.zone?.code || "ZONE",
      direction: l.direction || "IN",
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      device: l.device?.name || l.deviceId || "SCN",
    }));
    return { items, total: data?.total || items.length };
  } catch (e) {
    return { items: [], total: 0 };
  }
}

export async function deleteAccessLogsApi(ids: string[]): Promise<void> {
  await apiClient(`${ENDPOINTS.ACCESS_LOGS.BASE}?ids=${ids.join(",")}`, { method: "DELETE" });
}

export async function fetchMealLogs(params?: any): Promise<MealLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || data?.items || [];
    return list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      mealType: l.mealSchedule?.mealType === "BREAKFAST" ? "Nonushta" : l.mealSchedule?.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      point: l.device?.name || l.deviceId || "OSHXONA",
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchMealLogsPaginated(params?: any): Promise<{ items: MealLogEntry[], total: number }> {
  try {
    const data = await apiClient(ENDPOINTS.MEAL_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.items || data?.data || [];
    const items = list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      mealType: l.mealSchedule?.mealType === "BREAKFAST" ? "Nonushta" : l.mealSchedule?.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      point: l.device?.name || l.deviceId || "OSHXONA",
    }));
    return { items, total: data?.total || items.length };
  } catch (e) {
    return { items: [], total: 0 };
  }
}

export async function deleteMealLogsApi(ids: string[]): Promise<void> {
  await apiClient(`${ENDPOINTS.MEAL_LOGS.BASE}?ids=${ids.join(",")}`, { method: "DELETE" });
}

export async function fetchUsers(): Promise<SystemUser[]> {
  try {
    const data = await apiClient(ENDPOINTS.USERS.BASE);
    if (Array.isArray(data)) {
      return data.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        roleIds: u.roles?.map((r: any) => r.role?.id || r.roleId || r.role?.name) || [],
        status: u.isActive ? "faol" : "bloklangan",
        lastActive: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—",
        assignedZoneId: u.assignedZoneId || u.assignedZone?.id,
        assignedZone: u.assignedZone ? { id: u.assignedZone.id, name: u.assignedZone.name, code: u.assignedZone.code } : undefined,
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
  assignedZoneId?: string;
}): Promise<SystemUser> {
  const u = await apiClient(ENDPOINTS.USERS.BASE, {
    method: "POST",
    body: JSON.stringify({
      fullName: data.fullName,
      username: data.username,
      password: data.password,
      roleIds: data.roleIds,
      assignedZoneId: data.assignedZoneId || undefined,
    }),
  });
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    roleIds: data.roleIds,
    status: "faol",
    lastActive: "—",
    assignedZoneId: u.assignedZoneId || u.assignedZone?.id,
    assignedZone: u.assignedZone,
  };
}

export async function updateUserApi(id: string, data: {
  fullName?: string;
  email?: string;
  roleIds?: string[];
  assignedZoneId?: string;
  isActive?: boolean;
}): Promise<SystemUser> {
  const u = await apiClient(`${ENDPOINTS.USERS.BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    roleIds: data.roleIds || (u.roles?.map((r: any) => r.role?.id || r.roleId) || []),
    status: u.isActive ? "faol" : "bloklangan",
    lastActive: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—",
    assignedZoneId: u.assignedZoneId || u.assignedZone?.id,
    assignedZone: u.assignedZone,
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
      body: JSON.stringify({ permissionCodes: permissionIds }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchAuditLogs(params?: any): Promise<AuditLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.AUDIT_LOGS.BASE, { params });
    const list = Array.isArray(data) ? data : data?.data || data?.items || [];
    return list.map((a: any) => ({
      id: a.id,
      actor: a.user ? a.user.fullName : "Tizim",
      action: a.action,
      target: `${a.entityType || "entity"}:${a.entityId || ""}`,
      timestamp: a.createdAt ? formatDateTime(a.createdAt) : "—",
      details: a.metadata ? JSON.stringify(a.metadata) : undefined,
    }));
  } catch (e) {
    return [];
  }
}

export async function fetchParticipantHistory(id: string): Promise<any[]> {
  try {
    const data = await apiClient(ENDPOINTS.PARTICIPANTS.HISTORY(id));
    const accessLogs = (data.accessLogs || []).map((l: any) => ({
      id: l.id,
      kind: "Zona",
      label: l.zone?.name || l.zoneId,
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
    }));
    const mealLogs = (data.mealLogs || []).map((l: any) => ({
      id: l.id,
      kind: "Ovqatlanish",
      label: l.mealSchedule?.mealType === "BREAKFAST" ? "Nonushta" : l.mealSchedule?.mealType === "LUNCH" ? "Tushlik" : "Kechki ovqat",
      result: l.result === "GRANTED" ? "ruxsat" : "rad",
      reason: l.denyReason,
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
    }));
    return [...accessLogs, ...mealLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (e) {
    return [];
  }
}

export async function fetchDeniedAccessLogs(): Promise<AccessLogEntry[]> {
  try {
    const data = await apiClient(ENDPOINTS.ACCESS_LOGS.DENIED);
    const list = Array.isArray(data) ? data : data?.data || data?.items || [];
    return list.map((l: any) => ({
      id: l.id,
      participantId: l.participantId || "",
      participantName: l.participant ? `${l.participant.firstName} ${l.participant.lastName}` : "Noma'lum",
      accreditation: (l.participant?.accreditationType?.code || "ATH") as AccreditationCode,
      zoneCode: l.zone?.code || "ZONE",
      direction: l.direction || "IN",
      timestamp: l.scannedAt ? formatDateTime(l.scannedAt) : "—",
      result: "rad",
      reason: l.denyReason,
      device: l.deviceId || "SCN",
    }));
  } catch (e) {
    return [];
  }
}

export async function setAccreditationTypeZonesApi(id: string, zoneIds: string[]): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.ACCREDITATION_TYPES.ZONES(id), {
      method: "POST",
      body: JSON.stringify({ zoneIds }),
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function fetchDevices(): Promise<any[]> {
  try {
    const data = await apiClient(ENDPOINTS.DEVICES.BASE);
    if (Array.isArray(data)) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        status: d.status === "ACTIVE" ? "faol" : "bekor_qilingan",
        zoneId: d.currentZoneId,
        zoneName: d.currentZone?.name || "—",
        lastSeenAt: d.lastSeenAt ? formatDateTime(d.lastSeenAt) : "—",
      }));
    }
  } catch (e) {
    // error
  }
  return [];
}

export async function createDeviceApi(data: { name: string; zoneId?: string; deviceKey?: string }): Promise<any> {
  const d = await apiClient(ENDPOINTS.DEVICES.BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    id: d.deviceId || d.id,
    name: d.name || data.name,
    status: "faol",
    zoneId: data.zoneId,
    deviceKey: d.deviceKey || d.rawDeviceKey,
  };
}

export async function updateDeviceApi(id: string, data: { name?: string; deviceKey?: string; status?: "ACTIVE" | "REVOKED" }): Promise<any> {
  const d = await apiClient(`${ENDPOINTS.DEVICES.BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return d;
}

export async function deleteDeviceApi(id: string): Promise<boolean> {
  await apiClient(`${ENDPOINTS.DEVICES.BASE}/${id}`, { method: "DELETE" });
  return true;
}

export async function revokeDeviceApi(id: string): Promise<boolean> {
  try {
    await apiClient(ENDPOINTS.DEVICES.REVOKE(id), { method: "POST" });
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteParticipantApi(id: string): Promise<boolean> {
  await apiClient(`${ENDPOINTS.PARTICIPANTS.BASE}/${id}`, { method: "DELETE" });
  return true;
}

export async function deleteZoneApi(id: string): Promise<boolean> {
  await apiClient(`${ENDPOINTS.ZONES.BASE}/${id}`, { method: "DELETE" });
  return true;
}

export async function deleteRoleApi(id: string): Promise<boolean> {
  await apiClient(`${ENDPOINTS.ROLES.BASE}/${id}`, { method: "DELETE" });
  return true;
}

export async function deleteUserApi(id: string): Promise<boolean> {
  await apiClient(`${ENDPOINTS.USERS.BASE}/${id}`, { method: "DELETE" });
  return true;
}
