# 🛒 Let Shop — E-Commerce App

Aplikasi e-commerce full-stack untuk tugas kuliah, terdiri dari Backend API, Web Admin, dan Android Mobile.

---

## 👤 Author

| Nama               | NIM               | Role                |
| ------------------ | ----------------- | ------------------- |
| Muhammad Habib     | 2315000029        | Fullstack Developer |
| Ahmad Fauzi        | 2315000030        | System Analyst      |
| Muhammad Yusuf     | 2315000025        | Product Manager     |
| M. Faiz Setiawan   | 2315000010        | UI/UX               |
| Alfa Zebua         | 2315000003        | UI/UX               |
| Tarisah Febriyanti | 2315000018        | QA/QC Engineer      |
| Acong Marlindo     | 2315000001        | Member              |







---

## 📁 Struktur Monorepo

```
e-commerce-petshop/
├── backend/        # Bun + Express + Prisma + PostgreSQL
├── web-admin/      # SvelteKit + Tailwind CSS (Neobrutalism)
└── android/        # Kotlin + Jetpack Compose
```

---

## 🧱 Tech Stack

### Backend

| Komponen  | Teknologi             |
| --------- | --------------------- |
| Runtime   | Bun v1.3.14           |
| Framework | Express.js            |
| ORM       | Prisma v5.22.0        |
| Database  | PostgreSQL (Docker)   |
| Auth      | JWT (stateless, 7d)   |
| Language  | TypeScript            |
| Upload    | Multer → local volume |

### Web Admin

| Komponen  | Teknologi              |
| --------- | ---------------------- |
| Framework | SvelteKit (TypeScript) |
| Styling   | Tailwind CSS v3        |
| Design    | Neobrutalism           |
| Chart     | Chart.js               |
| Icons     | lucide-svelte          |

### Android

| Komponen     | Teknologi             |
| ------------ | --------------------- |
| Language     | Kotlin                |
| UI           | Jetpack Compose       |
| Architecture | MVVM                  |
| HTTP         | Retrofit + OkHttp     |
| Image        | Coil                  |
| Storage      | DataStore Preferences |

---

## 🏛️ Arsitektur Backend

```
Request
  └── Router
        └── Controller      (terima request, kirim response)
              └── Service   (business logic, lempar AppError)
                    └── Repository  (query Prisma, tidak ada logic)
                              └── Prisma Client
                                    └── PostgreSQL
```

### Error Handling

Custom error classes dengan global middleware:

```
AppError (base)
├── NotFoundError     → 404
├── UnauthorizedError → 401
├── ForbiddenError    → 403
└── ValidationError   → 422
```

### Response Format

Semua endpoint menggunakan format konsisten:

```json
{
  "success": true,
  "message": "optional",
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 🚀 Cara Menjalankan

### Prerequisites

- [Bun](https://bun.sh) v1.3.14+
- [Docker](https://docker.com) & Docker Compose
- [Node.js](https://nodejs.org) v18+ (untuk web admin)
- Android Studio (untuk Android)

---

### 1. Clone Repository

```bash
git clone https://github.com/<!-- username kamu -->/e-commerce-petshop.git
cd e-commerce-petshop
```

---

### 2. Backend

#### Setup environment

```bash
cd backend
cp .env.example .env
```

Isi file `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/letshop"
JWT_SECRET="your-super-secret-key"
PORT=3000
NODE_ENV=development
```

#### Jalankan dengan Docker Compose

```bash
# Di root folder backend/
docker compose up -d
```

#### Jalankan migration & seed

```bash
bun prisma migrate deploy
bun prisma db seed
```

#### Akun default dari seed

| Role     | Email                | Password                     |
| -------- | -------------------- | ---------------------------- |
| Admin    | admin@letshop.com    | <!-- sesuaikan seed kamu --> |
| Customer | customer@letshop.com | <!-- sesuaikan seed kamu --> |

Backend berjalan di: `http://localhost:3000`

---

### 3. Web Admin

```bash
cd web-admin
npm install
npm run dev
```

Web admin berjalan di: `http://localhost:5173`

Login menggunakan akun **ADMIN** dari seed.

---

### 4. Android

1. Buka folder `android/` di Android Studio
2. Edit file `app/src/main/java/com/letshop/app/data/remote/RetrofitClient.kt`:
   ```kotlin
   const val BASE_URL = "http://192.168.x.x:3000/api/"
   // Ganti dengan IP lokal laptop kamu (cek via: ip addr / ipconfig)
   ```
3. Pastikan HP dan laptop terhubung ke WiFi yang sama
4. Run aplikasi ke device / emulator

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### Auth

| Method | Endpoint         | Auth   | Deskripsi              |
| ------ | ---------------- | ------ | ---------------------- |
| POST   | `/auth/register` | —      | Register user baru     |
| POST   | `/auth/login`    | —      | Login, dapat token JWT |
| GET    | `/auth/me`       | Bearer | Info user yang login   |

### Categories

| Method | Endpoint          | Auth  | Deskripsi           |
| ------ | ----------------- | ----- | ------------------- |
| GET    | `/categories`     | —     | List semua kategori |
| POST   | `/categories`     | Admin | Tambah kategori     |
| PUT    | `/categories/:id` | Admin | Edit kategori       |
| DELETE | `/categories/:id` | Admin | Hapus kategori      |

### Products

| Method | Endpoint        | Auth  | Deskripsi                                |
| ------ | --------------- | ----- | ---------------------------------------- |
| GET    | `/products`     | —     | List produk (search, filter, pagination) |
| GET    | `/products/:id` | —     | Detail produk + varian                   |
| POST   | `/products`     | Admin | Tambah produk (multipart/form-data)      |
| PUT    | `/products/:id` | Admin | Edit produk (multipart/form-data)        |
| DELETE | `/products/:id` | Admin | Hapus produk                             |

Query params untuk GET `/products`:

```
?search=nama     → cari nama produk
?categoryId=xxx  → filter by kategori
?page=1          → halaman
?limit=10        → jumlah per halaman
```

### Cart (Customer)

| Method | Endpoint        | Auth     | Deskripsi            |
| ------ | --------------- | -------- | -------------------- |
| GET    | `/cart`         | Customer | Lihat isi cart       |
| POST   | `/cart`         | Customer | Tambah item ke cart  |
| PUT    | `/cart/:itemId` | Customer | Update quantity item |
| DELETE | `/cart/:itemId` | Customer | Hapus item dari cart |

### Orders (Customer)

| Method | Endpoint      | Auth     | Deskripsi              |
| ------ | ------------- | -------- | ---------------------- |
| GET    | `/orders`     | Customer | List pesanan sendiri   |
| POST   | `/orders`     | Customer | Checkout dari cart     |
| GET    | `/orders/:id` | Customer | Detail pesanan sendiri |

### Admin

| Method | Endpoint                   | Auth  | Deskripsi              |
| ------ | -------------------------- | ----- | ---------------------- |
| GET    | `/admin/orders`            | Admin | Semua pesanan          |
| PATCH  | `/admin/orders/:id/status` | Admin | Update status pesanan  |
| GET    | `/admin/dashboard`         | Admin | Stats + grafik revenue |

Query params untuk GET `/admin/dashboard`:

```
?period=7d   → data 7 hari terakhir (default)
?period=30d  → data 30 hari terakhir
```

### Alur Status Pesanan

```
PENDING → DIPROSES → SELESAI
(satu arah, tidak bisa mundur)
```

---

## 🗄️ Database Schema

```
User ──────< Order ──────< OrderItem >────── ProductVariant >────── Product >────── Category
               │                                    │
              Cart ──────< CartItem >───────────────┘
```

---

## 📂 Struktur Folder Backend

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── uploads/              ← gambar produk tersimpan di sini
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   ├── env.ts
    │   └── prisma.ts
    ├── errors/
    │   ├── AppError.ts
    │   ├── NotFoundError.ts
    │   ├── UnauthorizedError.ts
    │   ├── ForbiddenError.ts
    │   └── ValidationError.ts
    ├── middlewares/
    │   ├── errorHandler.ts
    │   ├── authenticate.ts
    │   ├── authorize.ts
    │   └── upload.ts
    ├── modules/
    │   ├── auth/
    │   ├── product/
    │   ├── category/
    │   ├── cart/
    │   ├── order/
    │   └── dashboard/
    └── routes/
        └── index.ts
```

---

## 🖼️ Fitur Aplikasi

### Web Admin

- ✅ Login admin
- ✅ Dashboard: stats cards + line chart revenue
- ✅ Manajemen produk: list, tambah (dengan upload gambar + varian), edit, hapus
- ✅ Manajemen kategori: list + CRUD via modal
- ✅ Manajemen pesanan: list, filter status, detail, update status

### Android (Customer)

- ✅ Register & Login
- ✅ Browse produk (grid, search, filter kategori)
- ✅ Detail produk + pilih varian
- ✅ Keranjang belanja
- ✅ Checkout (alamat + metode pembayaran)
- ✅ Riwayat & detail pesanan

---

## 📝 Catatan Development

- Gambar produk diakses via `http://localhost:3000/uploads/:filename`
- Android butuh koneksi WiFi yang sama dengan laptop saat demo
- Edit `network_security_config.xml` jika IP berubah
- Stok otomatis berkurang saat checkout
- Cart otomatis kosong setelah checkout berhasil

---

## 📄 Lisensi

Dibuat untuk keperluan tugas kuliah. <!-- tambahkan lisensi jika perlu -->
