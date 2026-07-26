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
