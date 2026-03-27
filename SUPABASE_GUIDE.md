# Panduan Integrasi Supabase - Subaru ERP

Ikuti langkah-langkah cepat ini untuk mengaktifkan database real-time dan sinkronisasi data di aplikasi Subaru ERP.

## 1. Persiapan Proyek Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru (New Project).
3. Tunggu hingga database siap.

## 2. Menjalankan SQL Schema
1. Di dashboard Supabase, buka menu **SQL Editor**.
2. Klik **New Query**.
3. Buka file `supabase_schema.sql` di proyek ini.
4. Salin seluruh isi file tersebut dan tempelkan ke SQL Editor di Supabase.
5. Klik **Run**. Ini akan membuat semua tabel yang diperlukan dan mengatur kebijakan keamanan (RLS).

## 3. Konfigurasi Environment Variables
1. Di dashboard Supabase, buka menu **Project Settings** > **API**.
2. Salin **Project URL** dan **anon public API Key**.
3. Di AI Studio (atau file `.env` lokal), tambahkan variabel berikut:
   - `VITE_SUPABASE_URL`: (Tempel Project URL di sini)
   - `VITE_SUPABASE_ANON_KEY`: (Tempel anon public API Key di sini)

## 4. Inisialisasi Data
1. Setelah variabel lingkungan diatur, buka aplikasi Subaru ERP.
2. Masuk sebagai Admin (Username: `rudiaf`, Password: `subarualam26`).
3. Buka menu **Settings** > **Master Data**.
4. Klik tombol **Instalasi Produk Daging** dan **Instalasi Data Karyawan**.
5. Data akan otomatis tersinkronisasi ke database Supabase Anda.

## 5. Fitur Real-time
Aplikasi ini sudah dikonfigurasi untuk mendengarkan perubahan data secara real-time. Pastikan Anda telah mengaktifkan **Realtime** untuk tabel-tabel berikut di dashboard Supabase (**Database** > **Replication** > **Source: supabase_realtime**):
- `products`
- `transactions`
- `attendance`
- `system_logs`
- `users`

---
**Catatan Keamanan:** Kebijakan RLS dalam `supabase_schema.sql` saat ini diatur untuk akses publik (baca/tulis) guna mempermudah pengembangan awal. Untuk produksi, pastikan Anda membatasi akses berdasarkan peran pengguna (Role).
