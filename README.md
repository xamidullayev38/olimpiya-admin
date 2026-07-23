# QR Badge Tizimi — Admin Panel (UI qismi)

Musobaqa ishtirokchilarini akkreditatsiya qilish, zonalarga kirish nazorati
va ovqatlanish monitoringi tizimining **admin/operator veb-paneli**.
Texnik topshiriq (`QR_Badge_Tizimi_TZ.md`) asosida qurilgan.

Stack: **Next.js 14 (App Router) + TypeScript + Chakra UI v2**.
Hozircha barcha ma'lumotlar mock (`src/lib/mock-data.ts`) — backend API
tayyor bo'lgach, shu faylni fetch/axios chaqiruvlariga almashtirish kifoya,
chunki komponentlar `src/lib/types.ts`dagi tiplarga qarab ishlaydi.

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` → avtomatik `/dashboard`ga yo'naltiradi.

## Sahifalar

| Yo'l | Tavsif | TZ bo'limi |
|---|---|---|
| `/login` | Login/parol yoki PIN orqali kirish | FT-19 |
| `/dashboard` | Zonalar bo'yicha real-vaqt statistika, rad etilgan urinishlar | FT-21, FT-23 |
| `/participants` | Ishtirokchilar ro'yxati, qidiruv/filtr, badge preview | FT-1..FT-5 |
| `/zones` | Zonalar, sig'im/to'lish, ruxsat etilgan akkreditatsiya turlari | 3.3, FT-7 |
| `/meal-tracking` | Ovqatlanish jadvali va log — "kuniga bir marta" qoidasi | FT-11..FT-14 |
| `/reports` | Rad etilgan urinishlar, kirish tarixi, ovqatlanish statistikasi, eksport | FT-21..FT-25 |

## Struktura

```
src/
  app/
    login/page.tsx            — auth sahifasi (console layout'siz)
    (console)/layout.tsx       — sidebar + topbar shell
    (console)/dashboard/       — boshqaruv paneli
    (console)/participants/
    (console)/zones/
    (console)/meal-tracking/
    (console)/reports/
  components/                  — Sidebar, Topbar, BadgeCard, StatusPill, StatCard, QrGlyph
  lib/
    types.ts                   — TZ 3-bo'limdagi entity modelga mos TS tiplar
    mock-data.ts                — API ulanguncha ishlatiladigan namunaviy ma'lumot
  theme/index.ts                — Chakra dizayn tokenlari (rang, shrift, komponent variantlari)
```

## Keyingi qadam: backend API ulash

`src/lib/mock-data.ts` eksportlarini TZ 7-bo'limidagi endpointlarga (masalan
`GET /api/participants`, `POST /api/scan/access`, `GET /api/dashboard/live-stats`)
mos fetch funksiyalariga almashtiring. Komponentlar (`ParticipantsPage`,
`DashboardPage` va h.k.) `Participant[]`, `Zone[]`, `AccessLogEntry[]` kabi
tiplarni kutadi — mock massiv o'rniga real ma'lumot kelsa, UI o'zgarishsiz ishlaydi.

Auth (`/login`) hozircha shunchaki `/dashboard`ga o'tkazadi — JWT bilan
`POST /api/auth/login`ga ulash va tokenni saqlash (masalan HTTP-only cookie)
qoladi.
