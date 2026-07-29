import {
  AccreditationType,
  Participant,
  Zone,
  MealWindow,
  AccessLogEntry,
  MealLogEntry,
  SystemRole,
  SystemUser,
  Permission,
  AuditLogEntry,
  LiveStat,
} from "../types";

// ---------------------------------------------------------------------------
// Mock data — stands in for GET /api/... responses described in section 7
// of the TZ. Replace each export with a fetch() / API client call once the
// backend is live; component code should not need to change shape.
// ---------------------------------------------------------------------------

export const accreditationTypes: AccreditationType[] = [
  { id: "mock-ath", code: "ATH", name: "Sportchi", color: "#4C8DFF", allowedZoneCodes: ["FOP", "MPC", "REST", "MED", "WU"], mealAllowed: true },
  { id: "mock-coach", code: "COACH", name: "Murabbiy", color: "#3FB67F", allowedZoneCodes: ["FOP", "MPC", "REST", "WU"], mealAllowed: true },
  { id: "mock-ref", code: "REF", name: "Hakam", color: "#E8A23D", allowedZoneCodes: ["FOP", "MPC", "REST", "OC"], mealAllowed: true },
  { id: "mock-vol", code: "VOL", name: "Volontyor", color: "#9C7830", allowedZoneCodes: ["MPC", "REST", "OC"], mealAllowed: true },
  { id: "mock-del", code: "DEL", name: "Delegatsiya a'zosi", color: "#8D96A8", allowedZoneCodes: ["MPC", "OC", "VIP"], mealAllowed: false },
  { id: "mock-media", code: "MEDIA", name: "Jurnalist", color: "#D4A853", allowedZoneCodes: ["MPC", "MEDIA_C"], mealAllowed: false },
  { id: "mock-vip", code: "VIP", name: "VIP mehmon", color: "#E5484D", allowedZoneCodes: ["VIP", "OC"], mealAllowed: false },
];

export const zones: Zone[] = [
  { code: "FOP", name: "Musobaqa maydoni (FOP)", kind: "kirish_chiqish", scanPoints: 4, currentInside: 186, capacity: 400 },
  { code: "MPC", name: "Bosh akkreditatsiya markazi", kind: "kirish_chiqish", scanPoints: 3, currentInside: 342, capacity: 800 },
  { code: "VIP", name: "VIP zona", kind: "kirish_chiqish", scanPoints: 2, currentInside: 28, capacity: 120 },
  { code: "REST", name: "Restoran / Oshxona", kind: "kirish_chiqish", scanPoints: 2, currentInside: 74 },
  { code: "OC", name: "Ochilish marosimi zonasi", kind: "kirish_chiqish", scanPoints: 3, currentInside: 512, capacity: 2000 },
  { code: "MED", name: "Tibbiyot punkti", kind: "ochiq", scanPoints: 1, currentInside: 6 },
  { code: "WU", name: "Isinish zonasi (Warm-up)", kind: "kirish_chiqish", scanPoints: 2, currentInside: 41, capacity: 100 },
  { code: "MEDIA_C", name: "Press-markaz", kind: "kirish_chiqish", scanPoints: 1, currentInside: 19, capacity: 60 },
];

export const mealSchedule: MealWindow[] = [
  { day: "2026-08-14", mealType: "Nonushta", start: "07:00", end: "10:00", allowedAccreditations: ["ATH", "COACH", "REF", "VOL"] },
  { day: "2026-08-14", mealType: "Tushlik", start: "12:00", end: "15:00", allowedAccreditations: ["ATH", "COACH", "REF", "VOL"] },
  { day: "2026-08-14", mealType: "Kechki ovqat", start: "18:30", end: "21:00", allowedAccreditations: ["ATH", "COACH", "REF", "VOL"] },
];

const names = [
  "Aziza Yusupova", "Botir Rahimov", "Dilshod Karimov", "Elyor Tashkentov",
  "Farrux Normatov", "Gulnora Saidova", "Ibrohim Nazarov", "Jasur Ergashev",
  "Kamola Abdullayeva", "Laziz Mirzayev", "Madina Yoqubova", "Nodir Xolmatov",
  "Ozoda Tursunova", "Parvina Sobirova", "Quvonch Islomov", "Rustam Berdiyev",
  "Sevara Nabiyeva", "Timur Aliyev", "Ulug'bek Rashidov", "Vazira Qodirova",
  "Xurshid Yusupov", "Yulduz Ahmedova", "Zafar Tojiboyev", "Aziz Sharipov",
];

const orgs = ["O'zbekiston milliy terma jamoasi", "Toshkent viloyati", "Farg'ona viloyati", "Samarqand viloyati", "IBU-2026 tashkilotchilar qo'mitasi", "Xalqaro press-pul", "AIBA rasmiy hakamlar guruhi"];
const sports = ["Boks", "Kurash", "Yengil atletika", "Suzish", "Gimnastika", undefined];

function pad(n: number) { return n.toString().padStart(2, "0"); }

export const participants: Participant[] = names.map((fullName, i) => {
  const acc = accreditationTypes[i % accreditationTypes.length];
  const statusRoll = i % 11;
  return {
    id: `P-${1000 + i}`,
    fullName,
    pinfl: `3${pad(10 + i)}9${pad(20 + i)}0000${i}`,
    birthDate: `19${88 + (i % 12)}-0${(i % 9) + 1}-1${i % 9}`,
    docNumber: `AB${3000000 + i}`,
    phone: `+998 9${i % 9}${pad(10 + i)} ${pad(20 + i)} ${pad(30 + i)}`,
    accreditation: acc.code,
    sport: acc.code === "ATH" || acc.code === "COACH" ? sports[i % sports.length] : undefined,
    organization: orgs[i % orgs.length],
    badgeStatus: statusRoll === 0 ? "bloklangan" : statusRoll === 1 ? "muddati_tugagan" : "faol",
    badgeId: `BADGE-2026-${pad(i + 1)}${pad(i + 3)}`,
    qrToken: `qrt_${(i + 1) * 7919}${Math.abs((i * 31 + 17) % 999)}`,
    createdAt: `2026-07-${pad((i % 20) + 1)}`,
  };
});

export const accessLogs: AccessLogEntry[] = Array.from({ length: 40 }).map((_, i) => {
  const p = participants[i % participants.length];
  const zone = zones[i % zones.length];
  const acc = accreditationTypes.find((a) => a.code === p.accreditation)!;
  const denied = !acc.allowedZoneCodes.includes(zone.code) && i % 3 === 0;
  return {
    id: `AL-${5000 + i}`,
    participantId: p.id,
    participantName: p.fullName,
    accreditation: p.accreditation,
    zoneCode: zone.code,
    direction: i % 2 === 0 ? "IN" : "OUT",
    timestamp: `2026-08-14 ${pad(7 + (i % 14))}:${pad((i * 7) % 60)}:${pad((i * 13) % 60)}`,
    result: denied ? "rad" : "ruxsat",
    reason: denied ? "Bu zonaga ruxsat yo'q" : undefined,
    device: `SCN-${(i % 6) + 1}`,
  };
});

export const mealLogs: MealLogEntry[] = Array.from({ length: 30 }).map((_, i) => {
  const p = participants[(i * 3) % participants.length];
  const meal = mealSchedule[i % mealSchedule.length];
  const acc = accreditationTypes.find((a) => a.code === p.accreditation)!;
  const alreadyTaken = !acc.mealAllowed ? false : i % 8 === 0;
  const denied = !acc.mealAllowed || alreadyTaken;
  return {
    id: `ML-${7000 + i}`,
    participantId: p.id,
    participantName: p.fullName,
    accreditation: p.accreditation,
    mealType: meal.mealType,
    timestamp: `2026-08-14 ${meal.start.split(":")[0]}:${pad((i * 9) % 59)}`,
    result: denied ? "rad" : "ruxsat",
    reason: !acc.mealAllowed
      ? "Ushbu akkreditatsiya turiga ovqatlanish ruxsati yo'q"
      : alreadyTaken
      ? `Siz bugun ${meal.mealType.toLowerCase()}ni allaqachon olgansiz (${meal.start} atrofida)`
      : undefined,
    point: "Restoran / Oshxona",
  };
});

// FT-26: Super Admin ruxsat biriktiradigan permission katalogi.
// Guruhlar TZ 4.6 misolidagi kodlarga mos: participant.create, badge.print,
// report.export, zone.manage va h.k.
export const permissionCatalog: Permission[] = [
  { key: "participant.create", label: "Ishtirokchi qo'shish", group: "Ishtirokchilar" },
  { key: "participant.edit", label: "Ishtirokchini tahrirlash", group: "Ishtirokchilar" },
  { key: "participant.import", label: "Excel/CSV import qilish", group: "Ishtirokchilar" },
  { key: "badge.generate", label: "Badge (QR) generatsiya qilish", group: "Ishtirokchilar" },
  { key: "badge.print", label: "Badge chop etish", group: "Ishtirokchilar" },
  { key: "zone.manage", label: "Zona qo'shish/tahrirlash", group: "Zonalar" },
  { key: "zone.view", label: "Zona holatini ko'rish", group: "Zonalar" },
  { key: "scan.access", label: "Zona kirish skanerini ishlatish", group: "Skanerlash" },
  { key: "scan.meal", label: "Ovqatlanish skanerini ishlatish", group: "Skanerlash" },
  { key: "access-log.view", label: "Kirish tarixini ko'rish", group: "Skanerlash" },
  { key: "report.view", label: "Hisobotlarni ko'rish", group: "Hisobotlar" },
  { key: "report.export", label: "Excel/PDF eksport qilish", group: "Hisobotlar" },
  { key: "role.manage", label: "Rol va ruxsatlarni boshqarish", group: "Tizim" },
  { key: "user.manage", label: "Tizim foydalanuvchilarini boshqarish", group: "Tizim" },
  { key: "audit.view", label: "Audit log'ni ko'rish", group: "Tizim" },
];

// 2-bo'lim jadvalidagi rollarga mos boshlang'ich (built-in) rollar.
export const roles: SystemRole[] = [
  { id: "R-1", name: "Super Admin", permissions: permissionCatalog.map((p) => p.key), usersCount: 2, builtIn: true },
  { id: "R-2", name: "Operator (Akkreditatsiya xodimi)", permissions: ["participant.create", "participant.edit", "participant.import", "badge.generate", "badge.print"], usersCount: 6, builtIn: true },
  { id: "R-3", name: "Zona menejeri", permissions: ["zone.view", "access-log.view"], usersCount: 8, builtIn: true },
  { id: "R-4", name: "Skaner operatori (Qo'riqchi/Nazoratchi)", permissions: ["scan.access"], usersCount: 24, builtIn: true },
  { id: "R-5", name: "Oshxona xodimi", permissions: ["scan.meal"], usersCount: 10, builtIn: true },
  { id: "R-6", name: "Kuzatuvchi/Tahlilchi", permissions: ["report.view", "report.export"], usersCount: 4, builtIn: true },
];

const staffNames = [
  "Alisher Nazarov", "Dilnoza Ergasheva", "Sardor Islomov", "Feruza Tosheva",
  "Otabek Yusupov", "Nilufar Qosimova", "Jahongir Mirzayev", "Shahnoza Rahimova",
];

export const systemUsers: SystemUser[] = staffNames.map((fullName, i) => ({
  id: `U-${100 + i}`,
  fullName,
  username: fullName.toLowerCase().replace(/[^a-z ']/g, "").replace(/'/g, "").split(" ").join(".") + ".uz",
  roleIds: i === 0 ? ["R-1"] : [roles[1 + (i % (roles.length - 1))].id],
  status: i === 6 ? "bloklangan" : "faol",
  lastActive: `2026-08-14 ${pad(6 + i)}:${pad((i * 11) % 60)}`,
}));

export const auditLog: AuditLogEntry[] = [
  { id: "AU-1", actor: "Alisher Nazarov", action: "Rol yaratildi", target: "Kuzatuvchi/Tahlilchi", timestamp: "2026-08-10 09:12:04", details: "report.view, report.export ruxsatlari bilan" },
  { id: "AU-2", actor: "Dilnoza Ergasheva", action: "Ishtirokchi qo'shildi", target: "Botir Rahimov (P-1001)", timestamp: "2026-08-12 11:03:41" },
  { id: "AU-3", actor: "Alisher Nazarov", action: "Zona tahrirlandi", target: "VIP zona (sig'im 100 → 120)", timestamp: "2026-08-12 14:22:10" },
  { id: "AU-4", actor: "Sardor Islomov", action: "Badge bloklandi", target: "Kamola Abdullayeva (BADGE-2026-0810)", timestamp: "2026-08-13 08:47:55", details: "Sabab: shubhali qayta urinishlar" },
  { id: "AU-5", actor: "Alisher Nazarov", action: "Foydalanuvchiga rol biriktirildi", target: "Feruza Tosheva → Zona menejeri", timestamp: "2026-08-13 10:15:30" },
  { id: "AU-6", actor: "Dilnoza Ergasheva", action: "Excel import", target: "48 ta ishtirokchi (Farg'ona viloyati)", timestamp: "2026-08-13 16:40:02" },
  { id: "AU-7", actor: "Jahongir Mirzayev", action: "Hisobot eksport qilindi", target: "Rad etilgan urinishlar — PDF", timestamp: "2026-08-14 07:58:19" },
  { id: "AU-8", actor: "Alisher Nazarov", action: "Foydalanuvchi bloklandi", target: "Shahnoza Rahimova", timestamp: "2026-08-14 08:05:47", details: "Sabab: ishdan bo'shatilgan" },
];

export const liveStats: LiveStat[] = zones.map((z) => ({
  zoneCode: z.code,
  zoneName: z.name,
  inside: z.currentInside,
  capacity: z.capacity,
  inToday: Math.round(z.currentInside * 1.8),
  outToday: Math.round(z.currentInside * 1.4),
}));

export function accreditationByCode(code: string) {
  return accreditationTypes.find((a) => a.code === code)!;
}

export function zoneByCode(code: string) {
  return zones.find((z) => z.code === code)!;
}
