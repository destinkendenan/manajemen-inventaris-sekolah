# Sistem Manajemen Inventaris Sekolah

![Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

> **CATATAN**: Proyek ini masih dalam tahap pengembangan aktif. Beberapa fitur mungkin belum berfungsi dengan sempurna atau masih dalam proses implementasi.

## Deskripsi Proyek

Sistem Manajemen Inventaris Sekolah adalah aplikasi web yang dirancang untuk memudahkan pengelolaan aset dan barang inventaris di lingkungan sekolah. Aplikasi ini memungkinkan petugas untuk melacak, memantau, dan mengelola berbagai barang inventaris sekolah, serta menangani proses peminjaman dan pengembalian barang oleh siswa dan staf.

## Fitur Utama

### 1. Manajemen Barang
- ✅ Tambah, edit, dan hapus data barang
- ✅ Pencarian barang berdasarkan nama, kode, atau kategori
- ✅ Kategorisasi barang inventaris
- 🔄 Pelacakan stok dan ketersediaan barang (in progress)

### 2. Sistem Peminjaman
- ✅ Permohonan peminjaman barang oleh pengguna
- ✅ Persetujuan peminjaman oleh admin
- ✅ Pencatatan tanggal peminjaman dan batas pengembalian
- ✅ Proses pengembalian barang

### 3. Pelaporan
- ✅ Laporan inventaris barang
- ✅ Laporan peminjaman 
- ✅ Laporan aktivitas sistem
- ✅ Export laporan ke PDF dan Excel

### 4. Manajemen Pengguna
- ✅ Sistem login dengan autentikasi
- ✅ Manajemen user (admin/petugas dan siswa)
- ✅ Kontrol akses berdasarkan peran pengguna

### 5. Dashboard
- ✅ Dashboard admin dengan ringkasan data inventaris
- ✅ Dashboard user dengan riwayat peminjaman

## Teknologi yang Digunakan

### Frontend
- **React.js** - Library JavaScript untuk membangun antarmuka pengguna
- **DaisyUI & Tailwind CSS** - Framework CSS untuk styling
- **Axios** - HTTP client untuk API requests

### Backend
- **Node.js** - Runtime JavaScript server-side
- **Express.js** - Framework web untuk Node.js
- **Sequelize** - ORM untuk database
- **MySQL/MariaDB** - Database

## Struktur Proyek

```
manajemen-inventaris-sekolah/
├── server/                  # Backend Node.js + Express
│   ├── config/              # Konfigurasi database dan aplikasi
│   ├── controllers/         # Controllers API
│   ├── middleware/          # Middleware aplikasi
│   ├── models/              # Model Sequelize
│   ├── routes/              # Route API
│   └── utils/               # Fungsi utilitas
│
└── src/                     # Frontend React
    ├── assets/              # Asset statis (gambar, dll)
    ├── components/          # Komponen React
    │   ├── admin/           # Komponen khusus admin
    │   ├── common/          # Komponen umum
    │   └── user/            # Komponen khusus user
    ├── context/             # Context API React
    ├── hooks/               # Custom hooks
    ├── pages/               # Halaman utama
    ├── routes/              # Konfigurasi routing
    ├── services/            # Service untuk API calls
    └── utils/               # Fungsi utilitas
```

## Instalasi dan Penggunaan

### Prasyarat
- Node.js (v14 atau lebih baru)
- MySQL/MariaDB
- npm atau yarn

### Langkah Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/username/manajemen-inventaris-sekolah.git
   cd manajemen-inventaris-sekolah
   ```

2. **Instal dependensi frontend**
   ```bash
   npm install
   ```

3. **Instal dependensi backend**
   ```bash
   cd server
   npm install
   ```

4. **Konfigurasi database**
   - Buat database di MySQL/MariaDB
   - Sesuaikan file `.env` di folder server dengan kredensial database Anda
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=password
   DB_NAME=inventaris_sekolah
   ```

5. **Jalankan migrasi database**
   ```bash
   cd server
   npm run migrate
   ```

6. **Jalankan aplikasi**
   
   Backend:
   ```bash
   cd server
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd ..
   npm run dev
   ```

7. **Akses aplikasi**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Catatan Pengembangan

- Pagination masih dalam tahap pengembangan
- Beberapa fitur responsif masih perlu perbaikan
- Optimasi performa masih berlangsung
- Unit testing belum diimplementasikan

## Kontribusi

Karena proyek ini masih dalam pengembangan aktif, kontribusi sangat diterima! Silakan buat pull request atau laporkan issues yang Anda temukan.

## Lisensi

MIT License

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi [destinkendenan@gmail.com](mailto:destinkendenan@gmail.com)

---

© 2025 Sistem Manajemen Inventaris Sekolah
