# Sistem Informasi Manajemen Dinas Pertanian

Fullstack web app modern untuk Dinas Pertanian:

- `backend`: Laravel API + JWT + MySQL + Spatie Permission + Export PDF/Excel
- `frontend`: Next.js App Router + TypeScript + Tailwind + shadcn-style components

## 1) Setup Backend (Laravel)

```bash
cd backend
cp .env.example .env
```

Konfigurasi `.env` (Laragon MySQL):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sim_pertanian
DB_USERNAME=root
DB_PASSWORD=
AUTH_GUARD=api
JWT_TTL=120
```

Buat database `sim_pertanian` di MySQL Laragon, lalu jalankan:

```bash
composer install
php artisan jwt:secret
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Default akun seed:

- `admin@simpertanian.test` / `Password@123`
- `petugas@simpertanian.test` / `Password@123`
- `mitra@simpertanian.test` / `Password@123`

## 2) Setup Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 3) Fitur Utama

- JWT Authentication (`login`, `logout`, `refresh`, `profile`)
- Role & Permission (`Admin`, `Petugas`, `Mitra Petani`)
- CRUD Mitra Petani + upload foto
- CRUD Hasil Pertanian + statistik
- Dashboard analytics (line chart, pie chart, timeline aktivitas)
- Monitoring produksi & heatmap wilayah
- Laporan dengan export PDF / Excel
- Manajemen berita pertanian (public + admin)
- Notifikasi sistem
- Public website (landing, informasi, berita, kontak)

## 4) Struktur Endpoint API Inti

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/mitra`
- `GET|POST /api/hasil`
- `GET /api/harvests/statistics`
- `GET /api/reports/preview`
- `GET /api/reports/export/pdf`
- `GET /api/reports/export/excel`
- `GET /api/public/stats`
- `GET /api/public/news`

