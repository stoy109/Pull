# Planning Challenge 1 - Administrator, RBAC, dan Activity Monitoring

## 1. Sasaran

Memenuhi challenge **Multi-Role Collaboration & Activity Monitoring** dengan sistem yang:

- memiliki minimal tiga role dengan hak akses dan dashboard yang berbeda;
- menerapkan pembatasan akses secara nyata, bukan hanya menyembunyikan menu;
- mencatat aktivitas nyata dari fitur utama Pull;
- menyediakan dashboard Administrator yang membaca data aktual dari database;
- mudah dibuktikan dalam demo hackathon.

Dokumen ini bermula sebagai rancangan sebelum coding dan kini juga menjadi acuan status implementasi.

## Status Implementasi - 23 Juli 2026

Hardening setelah audit constraint juga telah menghubungkan metrik dan aktivitas
utama dashboard UMKM, Pekerja, serta Supplier ke Supabase. Angka ringkasan dan
daftar aktivitas pada halaman utama role tidak lagi memakai seed statis. Login
berhasil dicatat ketika kembali ke dashboard, dan tersedia verifikasi batas
akses untuk tiga akun domain melalui `npm run verify:roles`.

| Batch | Status | Hasil utama |
| --- | --- | --- |
| Batch 1 - Fondasi role dan keamanan | Selesai | Empat role, profil aman, RLS, route guard, redirect role, akun admin internal |
| Batch 2 - Activity log | Selesai untuk akun/keamanan | Login, logout, perubahan profil/role, akses ditolak, moderasi, dan presence tercatat dari aksi nyata |
| Batch 3 - Dashboard Administrator | Selesai | Metrik aktual, tren 7/30 hari, distribusi role, filter, refresh, loading, empty, dan error state |
| Batch 4 - Pengguna dan detail aktivitas | Selesai | Daftar/filter pengguna, log terfilter, pagination, suspend/reactivate, dan audit trail atomik |
| Batch 5 - Supplier dan hardening domain | Selesai | Lowongan UMKM, lamaran Pekerja, dan penawaran Supplier persisten dengan RLS serta audit otomatis |

Route Administrator yang tersedia:

- `/admin` - Ringkasan Monitoring;
- `/admin/users` - Manajemen Pengguna;
- `/admin/activity` - Log Aktivitas.

Migration remote yang sudah diterapkan adalah `001` sampai `006`. Database lint, verifikasi RPC end-to-end, lint aplikasi, typecheck, unit test, dan production build telah lulus. QA visual dengan in-app Browser belum dijalankan karena tidak ada browser yang tersedia pada sesi implementasi.

## 2. Keputusan Role

Pull sebaiknya menggunakan empat role:

| Role | Cara mendapatkan akun | Tanggung jawab utama | Dashboard |
| --- | --- | --- | --- |
| Administrator | Dibuat internal melalui seed/console, tidak tersedia di onboarding publik | Monitoring pengguna, aktivitas, keamanan, dan tindakan moderasi | `/admin` |
| UMKM | Registrasi dan onboarding publik | Mengelola usaha, pool, lowongan, pelamar, dan pekerja | `/dashboard` |
| Pekerja | Registrasi dan onboarding publik | Mencari lowongan, melamar, mengelola pekerjaan dan reputasi | `/worker/dashboard` |
| Supplier | Registrasi dan onboarding publik | Mengelola penawaran bahan, pesanan/pool yang dilayani, dan distribusi | `/supplier` |

Administrator dihitung sebagai role sistem, tetapi tiga role domain Pull tetap dipertahankan agar kolaborasi platform terlihat kuat. Untuk scope hackathon, cukup satu jenis Administrator. Tidak perlu membuat Super Admin, Moderator, dan Support sebagai role terpisah kecuali ada kebutuhan lanjutan.

## 3. Temuan Audit Repository

Kondisi yang sudah ada:

- Onboarding sudah menyediakan `umkm`, `pekerja`, dan `supplier`.
- Dashboard UMKM dan Pekerja sudah memiliki tampilan yang berbeda.
- Supabase Auth sudah digunakan untuk login dan membaca pengguna aktif.
- Halaman aktivitas UMKM dan Pekerja sudah tersedia secara visual.

Gap terhadap challenge:

- Role tersimpan di `user_metadata` yang juga diperbarui dari alur onboarding; sumber ini tidak boleh menjadi dasar otorisasi Administrator.
- Belum ada role dan route khusus Administrator.
- Protected layout hanya memastikan sesi login; belum ada pemeriksaan role terpusat untuk setiap area.
- Route UMKM hanya memisahkan Pekerja. Supplier masih dapat masuk ke dashboard UMKM.
- Halaman aktivitas UMKM, Pekerja, dan ringkasan dashboard masih memakai data mock/static.
- Belum ditemukan migration atau tabel khusus profil, role, presence, dan activity log.
- Belum ada pencatatan aktivitas lintas fitur yang dapat dibaca Administrator.

## 4. Akun Administrator

### 4.1 Aturan akun

- Administrator tidak muncul pada pilihan role onboarding.
- Akun Administrator dibuat secara internal melalui seed development atau Supabase Dashboard.
- Role otorisasi disimpan di data yang tidak dapat diubah pengguna, misalnya `app_metadata` atau tabel `user_roles` dengan RLS ketat.
- `user_metadata` hanya digunakan untuk data profil seperti nama, nama bisnis, telepon, dan preferensi.
- Administrator tetap menggunakan login yang sama dengan pengguna lain, lalu sistem mengarahkan berdasarkan role.
- Setiap tindakan Administrator wajib masuk ke activity/audit log.

### 4.2 Akun demo minimum

Siapkan empat akun demo:

1. `admin` - membuka monitoring dan melakukan moderasi.
2. `umkm` - membuat lowongan atau aktivitas Pool.
3. `pekerja` - melamar lowongan atau memperbarui profil.
4. `supplier` - mengelola penawaran/pesanan supplier.

Kredensial demo tidak boleh ditanam di source code. Simpan pada environment/seed lokal dan dokumentasi internal yang tidak dikomit jika berisi password.

## 5. Struktur Dashboard Administrator

### 5.1 Menu utama

1. **Ringkasan Monitoring** - kondisi platform dan aktivitas terbaru.
2. **Manajemen Pengguna** - daftar pengguna, detail, status, dan tindakan moderasi.
3. **Log Aktivitas** - pencarian dan filter seluruh event yang tercatat.
4. **Pengaturan Admin** - profil dan keamanan akun Administrator.

Menu tambahan seperti laporan, verifikasi dokumen, atau moderasi konten hanya ditambahkan bila fitur sumbernya sudah benar-benar tersedia. Hindari menu kosong untuk demo.

### 5.2 Halaman Ringkasan Monitoring `/admin`

Bagian yang wajib ada:

- Header berisi judul, waktu pembaruan terakhir, dan tombol refresh.
- Empat kartu metrik:
  - Pengguna aktif;
  - Aktivitas hari ini;
  - Total pengguna;
  - Aktivitas gagal/perlu perhatian.
- Distribusi pengguna atau aktivitas berdasarkan role: UMKM, Pekerja, Supplier, Administrator.
- Tren aktivitas tujuh hari terakhir.
- Daftar aktivitas terbaru.
- Ringkasan pengguna baru per role.
- Tautan cepat menuju Manajemen Pengguna dan Log Aktivitas.

Definisi metrik harus eksplisit:

- **Pengguna aktif**: pengguna dengan `last_active_at` dalam 15 menit terakhir.
- **Aktivitas hari ini**: event sejak pukul 00.00 pada zona waktu aplikasi.
- **Total pengguna**: akun non-deleted yang tercatat pada profil.
- **Perlu perhatian**: event gagal, akses ditolak, atau pengguna berstatus ditangguhkan.

Jika heartbeat 15 menit belum siap pada batch awal, gunakan label jujur **Aktif 24 jam terakhir**, bukan menampilkan angka seolah-olah online real-time.

### 5.3 Halaman Manajemen Pengguna `/admin/users`

Tabel minimum:

- nama dan email;
- role;
- status akun;
- waktu aktif terakhir;
- jumlah aktivitas hari ini;
- tanggal bergabung;
- aksi **Lihat Detail**.

Filter minimum:

- pencarian nama/email;
- role;
- status akun;
- periode aktif terakhir.

Detail pengguna menampilkan profil ringkas, role, status, riwayat aktivitas, dan tombol moderasi. Tindakan hackathon yang cukup:

- Tangguhkan akun;
- Aktifkan kembali akun.

Perubahan role tidak perlu dijadikan aksi harian. Bila disediakan, hanya Administrator yang boleh menjalankannya, harus memakai modal konfirmasi, dan wajib tercatat pada audit log. Administrator tidak boleh menurunkan role akun sendiri.

### 5.4 Halaman Log Aktivitas `/admin/activity`

Kartu ringkasan:

- total event pada periode terpilih;
- event berhasil;
- event gagal/ditolak;
- aktor unik.

Filter minimum:

- periode tanggal;
- role;
- kategori event;
- status hasil;
- pencarian aktor atau target.

Kolom tabel:

- waktu;
- aktor;
- role aktor;
- aktivitas;
- target/objek;
- kategori;
- status;
- tombol detail.

Drawer/modal detail dapat menampilkan deskripsi event, ID objek, metadata aman, dan waktu lengkap. Jangan tampilkan password, access token, refresh token, isi OTP, atau data pribadi sensitif.

## 6. Katalog Aktivitas Minimum

Event memakai konstanta/enum terpusat, bukan teks bebas yang tersebar.

### Authentication dan akun

- `auth.login_succeeded`
- `auth.login_failed`
- `auth.logout`
- `profile.updated`
- `account.suspended`
- `account.reactivated`
- `role.changed`
- `access.denied`

### UMKM dan rekrutmen

- `job.created`
- `job.published`
- `job.updated`
- `application.accepted`
- `application.rejected`
- `assignment.completed`

### Pekerja

- `application.submitted`
- `application.withdrawn`
- `work.confirmed`
- `rating.submitted`

### Pool dan Supplier

- `pool.created`
- `pool.joined`
- `pool.status_changed`
- `supplier.offer_created`
- `supplier.order_status_changed`

MVP tidak perlu mencatat setiap klik dan page view. Catat event bisnis yang penting, perubahan keamanan, dan aksi Administrator agar log tetap bernilai.

## 7. Rancangan Data

Nama final harus menyesuaikan konvensi Supabase repository, tetapi kebutuhan minimalnya:

### `profiles`

- `id` - FK ke pengguna auth;
- `display_name`;
- `role` atau relasi ke `user_roles`;
- `account_status` - `active`, `suspended`;
- `last_active_at`;
- `created_at`;
- `updated_at`.

### `activity_logs`

- `id`;
- `actor_id`;
- `actor_role` - snapshot role saat event terjadi;
- `event_type`;
- `category`;
- `target_type`;
- `target_id`;
- `description`;
- `status` - `success`, `failed`, `denied`;
- `metadata` - JSON terbatas dan sudah disanitasi;
- `created_at`.

### `user_presence` atau kolom presence pada `profiles`

- `user_id`;
- `last_seen_at`;
- `session_started_at` bila diperlukan;
- `updated_at`.

Presence diperbarui dari sesi pengguna terautentikasi secara throttled, misalnya maksimal sekali per menit. Jangan membuat satu event log baru untuk setiap heartbeat.

## 8. Arsitektur RBAC

RBAC diterapkan berlapis:

1. **Database/RLS** - lapisan utama yang membatasi data berdasarkan role dan kepemilikan.
2. **Server authorization helper** - `requireUser()` dan `requireRole(...)` dipanggil pada layout/page/action.
3. **Role-specific layouts** - `/admin`, `/dashboard`, `/worker`, dan `/supplier` memiliki guard masing-masing.
4. **UI navigation** - menu hanya menampilkan fitur yang relevan, tetapi bukan satu-satunya proteksi.
5. **Server actions/API** - selalu memeriksa ulang sesi dan role sebelum mutation.

Aturan akses inti:

| Resource | Admin | UMKM | Pekerja | Supplier |
| --- | --- | --- | --- | --- |
| Monitoring seluruh pengguna | Baca | Tidak | Tidak | Tidak |
| Log aktivitas seluruh sistem | Baca | Tidak | Tidak | Tidak |
| Log aktivitas sendiri | Baca | Baca | Baca | Baca |
| Pengguna lain | Baca/moderasi terbatas | Data publik/relevan saja | Data publik/relevan saja | Data publik/relevan saja |
| Lowongan milik UMKM | Monitoring | Kelola milik sendiri | Baca dan lamar | Tidak |
| Penawaran Supplier | Monitoring | Baca/join sesuai fitur | Tidak | Kelola milik sendiri |
| Status akun | Kelola terbatas | Baca sendiri | Baca sendiri | Baca sendiri |

## 9. Integrasi Activity Log

Gunakan satu service/helper pencatatan yang dipanggil setelah mutation bisnis berhasil. Untuk event kritis seperti perubahan status akun atau role, database trigger/RPC lebih aman agar pencatatan dan perubahan data bersifat atomik.

Prinsip:

- Event hanya dibuat dari aksi nyata.
- `actor_id` diambil dari sesi server, bukan input bebas dari client.
- Event gagal/akses ditolak dicatat tanpa menyimpan data sensitif.
- Deskripsi yang tampil kepada manusia diturunkan dari `event_type` dan metadata terstruktur.
- Tabel aktivitas mendukung pagination berbasis cursor atau pola pagination project.
- Query statistik menggunakan agregasi database dan rentang waktu, bukan menghitung seluruh data di browser.

## 10. Perbedaan Dashboard Antar-Role

Agar dapat dibuktikan saat demo, dashboard tidak boleh hanya mengganti nama pengguna.

### UMKM

- metrik lowongan, pelamar, pool, dan pekerjaan;
- menu Papan Loker, Pool Patungan, Profil Bisnis, Trust Score;
- aksi utama posting lowongan dan membuat/join pool.

### Pekerja

- metrik lamaran, pekerjaan aktif, rekomendasi lowongan, dan reputasi;
- menu Cari Kerja, Lamaran, Keahlian, Sertifikat, Trust Score;
- aksi utama melamar dan konfirmasi pekerjaan.

### Supplier

- metrik penawaran aktif, pool/pesanan masuk, volume, dan pengiriman;
- menu Penawaran, Pesanan/Pool, Pengiriman, Profil Supplier;
- aksi utama membuat penawaran dan memperbarui status pesanan.

### Administrator

- metrik pengguna dan aktivitas platform;
- menu Monitoring, Pengguna, dan Log Aktivitas;
- aksi utama memeriksa detail, memfilter log, dan moderasi akun.

## 11. Urutan Implementasi

### Batch 1 - Fondasi role dan keamanan

- Buat migration `profiles`, role aman, status akun, dan RLS.
- Migrasikan role pengguna lama dari metadata dengan aman.
- Buat helper otorisasi server terpusat.
- Tambahkan redirect setelah login berdasarkan role.
- Pisahkan route Supplier dari dashboard UMKM.
- Buat seed akun demo tanpa menyimpan password di repository.

**Selesai bila:** setiap role hanya dapat membuka route miliknya dan URL langsung ke route terlarang menghasilkan redirect/forbidden yang benar.

### Batch 2 - Activity log terintegrasi

- Buat migration `activity_logs` dan policy.
- Buat helper/RPC pencatatan aktivitas.
- Integrasikan event autentikasi dan minimal satu alur bisnis per role.
- Tambahkan pencatatan `access.denied` dan aksi Administrator.
- Tambahkan `last_active_at` atau presence throttled.

**Selesai bila:** aksi UMKM, Pekerja, dan Supplier menghasilkan record nyata yang dapat dibaca Administrator.

### Batch 3 - Dashboard Administrator

- Buat admin shell dan navigasi responsif.
- Implementasikan kartu metrik, distribusi role, tren, dan aktivitas terbaru.
- Tambahkan filter periode dan role yang benar-benar mengubah query/tampilan.
- Sediakan loading, empty, error, dan retry state.

**Selesai bila:** metrik berubah setelah aktivitas demo baru dilakukan dan tidak berasal dari konstanta mock.

### Batch 4 - Pengguna dan detail aktivitas

- Implementasikan tabel pengguna dan detail pengguna.
- Implementasikan suspend/reactivate dengan konfirmasi.
- Implementasikan tabel log aktivitas, filter, pagination, dan detail event.
- Pastikan tindakan moderasi tercatat sebagai event baru.

**Selesai bila:** admin dapat menangguhkan akun, akun tersebut kehilangan akses sesuai aturan, lalu event moderasi muncul di log.

### Batch 5 - Dashboard Supplier minimum dan hardening

- Bangun dashboard Supplier yang berbeda dan terhubung ke satu alur data nyata.
- Tambahkan pengujian RBAC, RLS, statistik, filter, dan activity logging.
- Jalankan lint, type-check, test, dan production build.
- Verifikasi desktop/mobile serta siapkan data dan skenario demo.

**Selesai bila:** empat akun demo memiliki dashboard berbeda dan challenge dapat dibuktikan end-to-end.

## 12. Acceptance Criteria

### RBAC

- Pengguna tanpa sesi tidak dapat membuka protected route.
- UMKM tidak dapat membuka `/admin`, `/worker`, atau `/supplier`.
- Pekerja tidak dapat membuka `/admin`, `/dashboard`, atau `/supplier`.
- Supplier tidak dapat membuka `/admin`, `/dashboard`, atau `/worker`.
- Administrator dapat membuka `/admin` tetapi tidak mengambil alih data domain melalui client tanpa policy.
- Mengubah `user_metadata.role` dari client tidak memberikan hak Administrator.

### Monitoring

- Jumlah pengguna aktif berasal dari `last_active_at`/presence.
- Jumlah aktivitas hari ini berasal dari `activity_logs`.
- Aktivitas terbaru berurutan dari event paling baru.
- Distribusi role berasal dari data pengguna aktual.
- Filter periode dan role menghasilkan data yang berbeda.
- Empty, loading, dan error state tersedia.

### Activity log

- Mutation bisnis penting membuat tepat satu event sukses.
- Request berulang/idempotent tidak membuat event bisnis duplikat.
- Percobaan akses terlarang menghasilkan `access.denied` tanpa data sensitif.
- Suspend/reactivate menghasilkan audit trail dengan aktor Administrator.
- Pengguna biasa tidak dapat membaca log pengguna lain atau menulis log palsu.

## 13. Skenario Demo Challenge

1. Login sebagai UMKM, tampilkan dashboard dan posting satu lowongan.
2. Login sebagai Pekerja, tampilkan dashboard berbeda lalu kirim lamaran.
3. Login sebagai Supplier, tampilkan dashboard berbeda lalu perbarui satu penawaran/pesanan.
4. Login sebagai Administrator.
5. Tunjukkan metrik aktivitas hari ini dan distribusi role.
6. Filter log ke role Pekerja dan tunjukkan event lamaran yang baru dibuat.
7. Buka detail pengguna Pekerja dan tangguhkan akunnya.
8. Tunjukkan event `account.suspended` pada log.
9. Coba akses `/admin` dari akun UMKM/Pekerja untuk membuktikan route guard.
10. Tunjukkan bahwa data dashboard berubah dari aktivitas nyata, bukan mock.

## 14. Prioritas Scope Hackathon

### Wajib

- empat role dan dashboard berbeda;
- guard route dan RLS nyata;
- Administrator dashboard dengan metrik yang diminta challenge;
- activity log terintegrasi;
- filter role dan periode;
- user list serta suspend/reactivate;
- skenario demo dan pengujian akses.

### Jika waktu cukup

- realtime update dashboard;
- ekspor CSV;
- grafik kategori event yang lebih lengkap;
- notifikasi keamanan;
- detail session/device.

### Tidak perlu pada MVP

- banyak tingkatan admin;
- sistem permission builder yang kompleks;
- mencatat setiap klik/page view;
- impersonation pengguna;
- penghapusan permanen akun dari dashboard.

## 15. File/Area yang Diperkirakan Terlibat Saat Coding

Daftar final mengikuti audit implementasi dan dokumentasi Next.js lokal sebelum menulis kode:

- `app/(protected)/layout.tsx`;
- `proxy.ts` bila memang diperlukan oleh panduan Next.js versi project;
- `features/onboarding/actions.ts`;
- `features/auth/actions.ts`;
- route baru `app/(protected)/admin/**`;
- route baru `app/(protected)/supplier/**`;
- helper role/auth baru di `lib/` atau `features/auth/`;
- fitur baru `features/admin/**`;
- service activity log baru;
- migration/policy Supabase baru;
- test RBAC dan activity monitoring.

Sebelum coding, baca dokumentasi lokal pada `node_modules/next/dist/docs/` untuk autentikasi, authorization, route protection, server actions, dan routing yang sesuai dengan Next.js 16.2.10 di repository ini.
