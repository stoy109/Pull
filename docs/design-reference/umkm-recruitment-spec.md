

image(21).png
image(22).png
image(23).png

BYTESFEST2026_Gamelan³, Udah siap belom_ (1).docx
Document
Pada dashboard umkm itu bagaimana kalau mau oh pilih orangnya atau gimana dan pada dashboard pekerja itu ada liat detail nah menunggu respons apakah itu harus ada? atau gimana saya bingung alurnya seperti apa nanti konfirmasi looping 

Kebingungannya muncul karena ada satu tahap penting yang belum terlihat di dashboard UMKM: tahap memilih atau menerima pelamar.

Di proposal, alurnya baru menjelaskan bahwa pekerja menekan Lamar, diarahkan ke WhatsApp untuk komunikasi, lalu setelah pekerjaan selesai kedua pihak kembali ke Pull untuk melakukan konfirmasi. 

 Namun, belum dijelaskan secara tegas bagaimana UMKM menentukan pelamar yang diterima.

Alur yang paling masuk akal
1. Pekerja melamar
Pekerja membuka detail lowongan lalu menekan:

Lamar Pekerjaan

Saat tombol ditekan, sistem harus melakukan dua hal:

Menyimpan lamaran ke database Pull.

Setelah itu baru mengarahkan pekerja ke WhatsApp UMKM.

Status pekerja langsung menjadi:

Menunggu Respons

Jadi, status Menunggu Respons tetap harus ada. Status ini berarti lamaran sudah masuk, tetapi UMKM belum menerima atau menolaknya.

Kalau pengguna langsung diarahkan ke WhatsApp tanpa lamaran disimpan, sistem tidak akan tahu siapa yang benar-benar melamar. Karena itu, penyimpanan lamaran harus terjadi sebelum WhatsApp terbuka.

2. UMKM memilih pekerja
Pada dashboard UMKM:

Papan Loker → Lowongan Saya → Lihat Pelamar

Setelah menekan Lihat Pelamar, tampilkan daftar pelamar lengkap dengan:

Nama pekerja

Trust Score

Jumlah pekerjaan selesai

Rating

Portofolio atau sertifikat kerja

Lokasi

Tombol Lihat Profil

Tombol Terima

Tombol Tolak

Tombol Hubungi via WhatsApp

Pada desain sekarang hanya ada tombol Hubungi via WhatsApp. Itu belum cukup karena menghubungi belum tentu berarti menerima.

Tampilan tombolnya sebaiknya seperti ini:

Dimas Pratama
Trust Score: 82
14 pekerjaan selesai

[Lihat Profil] [Tolak] [Terima Pekerja]
[Hubungi via WhatsApp]
Setelah UMKM menekan Terima Pekerja, tampilkan konfirmasi:

Terima Dimas Pratama?

Dimas akan mengisi 1 dari 2 posisi yang tersedia.
Pekerja akan menerima notifikasi dan dapat menghubungi
Anda melalui WhatsApp.

[Batal] [Ya, Terima]
Barulah status pekerja berubah dari:

Menunggu Respons → Diterima

3. Kuota pekerja
Misalnya UMKM membutuhkan dua pekerja dan ada lima pelamar.

Jangan tampilkan hanya:

4/5

karena bisa membingungkan apakah itu empat pelamar dari lima posisi atau empat posisi sudah terisi.

Pisahkan menjadi:

5 pelamar
1 dari 2 pekerja telah dipilih
atau:

Pelamar: 5
Pekerja diterima: 1/2
Setelah dua pekerja diterima:

Kuota pekerja penuh
2 dari 2 pekerja telah dipilih
Status lowongan berubah menjadi:

Penuh

UMKM masih bisa melihat pelamar lain, tetapi tidak bisa menerima lagi kecuali membatalkan pekerja yang sebelumnya dipilih.

4. Status pada dashboard pekerja
Urutan status yang lebih jelas:

Status	Artinya
Menunggu Respons	Lamaran sudah dikirim, UMKM belum memutuskan
Diterima	Pekerja dipilih oleh UMKM
Sedang Berlangsung	Pekerjaan sudah memasuki tanggal kerja
Perlu Konfirmasi	Durasi pekerjaan sudah selesai dan harus dikonfirmasi
Menunggu Konfirmasi UMKM	Pekerja sudah konfirmasi, UMKM belum
Selesai	Kedua pihak sudah konfirmasi
Ditolak	Pekerja tidak dipilih
Dibatalkan	Lowongan atau kesepakatan dibatalkan
Jadi status Menunggu Respons memang diperlukan karena menjadi pembeda antara pekerja yang baru melamar dan pekerja yang sudah diterima.

5. Jangan langsung dari “Diterima” ke “Perlu Konfirmasi”
Setelah diterima, sebaiknya ada status:

Sedang Berlangsung

Contohnya:

Diterima
Pekerjaan dimulai pada 25 Juli 2026

[Hubungi via WhatsApp]
[Lihat Detail]
Saat tanggal kerja dimulai:

Sedang Berlangsung
25–27 Juli 2026
Setelah tanggal selesai:

Perlu Konfirmasi
Apakah pekerjaan ini telah selesai?

[Konfirmasi Selesai]
Tombol Konfirmasi Selesai tidak boleh muncul sebelum pekerjaan selesai. Proposal juga menyebut bahwa kedua pihak melakukan konfirmasi setelah pekerjaan selesai. 


Cara kerja konfirmasi agar tidak looping
Istilah Confirmation Loop memang terdengar seperti proses yang berulang. Di tampilan pengguna, lebih baik namanya diganti menjadi:

Konfirmasi Dua Pihak

Konfirmasi hanya dilakukan satu kali oleh setiap pihak, bukan berulang-ulang.

Kondisi pertama: belum ada yang konfirmasi
UMKM: Belum konfirmasi
Pekerja: Belum konfirmasi
Keduanya memiliki tombol:

Konfirmasi Selesai

Kondisi kedua: pekerja sudah konfirmasi
Pekerja: Sudah konfirmasi ✓
UMKM: Belum konfirmasi
Pada dashboard pekerja:

Menunggu konfirmasi dari Batik Laweyan Bu Sari
Tombol konfirmasi pekerja harus hilang atau menjadi nonaktif agar tidak bisa ditekan berkali-kali.

Pada dashboard UMKM masih tersedia:

Konfirmasi Selesai

Kondisi ketiga: UMKM sudah konfirmasi
UMKM: Sudah konfirmasi ✓
Pekerja: Belum konfirmasi
Pada dashboard UMKM:

Menunggu konfirmasi dari Edi Santoso
Kondisi keempat: kedua pihak sudah konfirmasi
UMKM: Sudah konfirmasi ✓
Pekerja: Sudah konfirmasi ✓
Sistem otomatis:

Mengubah status menjadi Selesai

Membuat Sertifikat Kerja Digital

Menambahkan riwayat ke portofolio pekerja

Memperbarui Trust Score

Menambahkan PullPoints

Membuka fitur rating

Di proposal, rating dan pembaruan reputasi memang baru berjalan setelah kedua pihak menyelesaikan konfirmasi. 


Jadi bukan looping tanpa akhir, melainkan:

Konfirmasi pekerja
        +
Konfirmasi UMKM
        ↓
Pekerjaan selesai
        ↓
Sertifikat dan rating terbuka
Alur lengkap dashboard UMKM
UMKM posting lowongan
        ↓
Lowongan terbuka
        ↓
Pekerja melamar
        ↓
UMKM melihat daftar pelamar
        ↓
UMKM memilih Terima atau Tolak
        ↓
Pekerja diterima
        ↓
Komunikasi melalui WhatsApp
        ↓
Pekerjaan berlangsung
        ↓
Durasi pekerjaan selesai
        ↓
Konfirmasi dua pihak
        ↓
Sertifikat kerja diterbitkan
        ↓
Kedua pihak dapat memberikan rating
Alur lengkap dashboard pekerja
Pekerja melihat lowongan
        ↓
Tekan Lamar
        ↓
Lamaran tersimpan
        ↓
Diarahkan ke WhatsApp
        ↓
Status: Menunggu Respons
        ↓
UMKM menerima atau menolak
        ↓
Jika diterima: Diterima
        ↓
Sedang Berlangsung
        ↓
Perlu Konfirmasi
        ↓
Menunggu konfirmasi pihak lain
        ↓
Selesai
        ↓
Sertifikat dan rating
Perubahan utama pada desainmu
Pada dashboard UMKM, tambahkan tombol:

Lihat Profil | Tolak | Terima Pekerja | WhatsApp
Pada dashboard pekerja, pertahankan:

Menunggu Respons
Diterima
Perlu Konfirmasi
Selesai
Ditolak
Namun tambahkan:

Sedang Berlangsung
Menunggu Konfirmasi UMKM
Dengan begitu alurnya jelas, UMKM benar-benar bisa memilih pekerja, dan proses konfirmasi tidak menjadi looping.


Worked for 17s
Bisa. Codex dapat membaca struktur repository, menerima screenshot/diagram sebagai referensi, mengedit file, menjalankan perintah, serta mengetes hasil implementasinya. 

Untuk grafis, paling aman minta Codex:

memakai icon library yang sudah ada;

membuat ilustrasi lokal berbentuk SVG;

membuat grafik/progress/timeline dengan HTML, CSS, atau komponen chart;

menyimpan aset di public/assets;

tidak mengambil gambar acak dari internet.

Untuk gambar raster atau ilustrasi kompleks, Codex dapat mengintegrasikan OpenAI Images API, tetapi fitur itu harus tersedia dan dikonfigurasi di proyek. 

Kirim screenshot desainmu ke Codex bersama prompt ini:

Pelajari repository ini terlebih dahulu, lalu implementasikan ulang dan perbaiki fitur Papan Loker khusus dashboard UMKM/pemberi kerja berdasarkan screenshot referensi yang saya lampirkan.

KERJAKAN LANGSUNG PADA CODEBASE

Anda diizinkan untuk:

- Membaca seluruh struktur repository.
- Menemukan halaman, route, component, state management, database schema, dan styling yang berhubungan dengan fitur Papan Loker.
- Mengedit atau membuat file baru yang diperlukan.
- Menjalankan project, lint, type-check, test, dan build.
- Memperbaiki error yang muncul akibat perubahan ini.
- Membuat reusable components.
- Membuat aset visual lokal berupa SVG, icon, empty-state illustration, progress indicator, dan timeline.
- Menyimpan aset baru di folder aset yang sesuai, misalnya public/assets atau public/illustrations.

Jangan hanya memberikan contoh kode atau penjelasan. Terapkan perubahan secara langsung ke repository.

BATASAN SCOPE

Untuk tahap ini, kerjakan hanya dashboard UMKM atau pemberi kerja.

Jangan mengubah atau membuat ulang dashboard pekerja terlebih dahulu, kecuali perubahan kecil pada shared types, API, atau database memang diperlukan agar alur UMKM berfungsi.

Jangan merusak fitur Pool Patungan, Profil Usaha, Trust Score, autentikasi, atau fitur lain yang sudah berjalan.

TAHAP PERTAMA — AUDIT PROJECT

Sebelum mengedit:

1. Identifikasi framework dan struktur project.
2. Temukan route dashboard UMKM.
3. Temukan implementasi Papan Loker dan Lowongan Saya yang sudah ada.
4. Temukan komponen yang dapat digunakan ulang.
5. Temukan icon library, styling system, database client, dan state management yang digunakan.
6. Periksa apakah data saat ini masih mock data atau sudah berasal dari database.
7. Catat file yang akan diubah.

Setelah audit, langsung lanjutkan implementasi tanpa menunggu persetujuan tambahan.

TUJUAN FITUR

Dashboard UMKM harus memungkinkan pemilik usaha:

1. Membuat dan memposting lowongan.
2. Menyimpan lowongan sebagai draft.
3. Melihat seluruh lowongan miliknya.
4. Melihat jumlah pelamar.
5. Melihat jumlah posisi yang telah terisi.
6. Membuka daftar pelamar.
7. Membuka profil dan rekam jejak pelamar.
8. Menghubungi pelamar melalui WhatsApp.
9. Menerima pekerja.
10. Menolak pelamar.
11. Membatalkan pekerja yang sebelumnya diterima sebelum pekerjaan dimulai.
12. Memantau pekerjaan sampai selesai.
13. Melakukan konfirmasi penyelesaian pekerjaan.
14. Memberikan rating setelah kedua pihak mengonfirmasi.

ATURAN ALUR UTAMA

Menghubungi pelamar melalui WhatsApp tidak sama dengan menerima pekerja.

Tombol “Hubungi via WhatsApp” hanya membuka komunikasi. Tombol tersebut tidak boleh mengubah status lamaran.

Status pelamar hanya berubah menjadi “Diterima” setelah UMKM menekan tombol “Terima Pekerja” dan menyetujui modal konfirmasi.

Pekerja yang baru mengirim lamaran memiliki status:

“Menunggu Respons”

Setelah UMKM menerima:

“Diterima”

Jika ditolak:

“Ditolak”

Jangan gunakan istilah “Confirmation Loop” pada antarmuka pengguna.

Gunakan istilah:

“Konfirmasi Dua Pihak”

Konfirmasi hanya dapat dilakukan satu kali oleh masing-masing pihak.

DESAIN VISUAL

Gunakan screenshot yang saya lampirkan sebagai visual reference.

Pertahankan identitas Pull:

- Warna utama hijau tua.
- Background dominan putih.
- Aksen kuning atau oranye.
- Pendekatan 60% putih, 30% hijau, dan 10% aksen.
- Sidebar hijau untuk desktop.
- Tampilan modern, bersih, profesional, dan mudah dipahami pengguna UMKM.
- Border halus, rounded cards, badge status, toast, modal, empty state, progress bar, dan timeline.
- Spacing harus lega dan tidak terlalu berdempetan.
- Buat responsive layout desktop, tablet, dan mobile.
- Gunakan bahasa Indonesia.
- Ikuti typography, spacing scale, button style, dan design token yang sudah digunakan project.

Jangan mengganti seluruh design system jika tidak diperlukan.

HALAMAN 1 — LOWONGAN SAYA

Buat atau perbaiki halaman “Lowongan Saya”.

Header:

- Breadcrumb: Home / Papan Loker / Lowongan Saya
- Judul: Lowongan Saya
- Deskripsi: Kelola lowongan kerja harian yang Anda posting.
- Tombol utama: “+ Posting Lowongan”

Sediakan tab:

- Semua
- Draft
- Terbuka
- Hampir Penuh
- Kuota Penuh
- Akan Dimulai
- Sedang Berlangsung
- Perlu Konfirmasi
- Selesai
- Dibatalkan

Sediakan:

- Pencarian judul pekerjaan.
- Filter status.
- Filter tanggal.
- Filter lokasi.

Pada desktop gunakan tabel dengan kolom:

- Judul pekerjaan
- Upah per hari
- Durasi
- Tanggal kerja
- Status
- Pelamar
- Posisi terisi
- Aksi

Contoh:

- Judul: Buruh Cuci Kain Batik
- Upah: Rp120.000/hari
- Durasi: 3 hari
- Tanggal: 25–27 Juli 2026
- Status: Terbuka
- Pelamar: 5 pelamar
- Posisi terisi: 1 dari 2
- Aksi: Lihat Pelamar

Jangan menampilkan angka ambigu seperti “4/5”.

Pisahkan menjadi:

- “5 pelamar”
- “1 dari 2 posisi terisi”

Pada mobile, ubah tabel menjadi card vertikal.

Tambahkan pagination atau load-more sesuai pola project yang sudah ada.

HALAMAN 2 — POSTING LOWONGAN

Buat halaman atau modal posting lowongan dengan field:

- Judul pekerjaan
- Kategori
- Lokasi
- Upah per hari
- Durasi
- Tanggal mulai
- Tanggal selesai
- Jumlah pekerja yang dibutuhkan
- Jam kerja
- Deskripsi pekerjaan
- Persyaratan atau keahlian
- Nomor WhatsApp

Tambahkan validasi.

Tombol:

- Simpan sebagai Draft
- Posting Lowongan

Toast setelah berhasil:

“Lowongan berhasil diposting.”

HALAMAN 3 — DAFTAR PELAMAR

Ketika tombol “Lihat Pelamar” ditekan, buka halaman daftar pelamar.

Header menampilkan:

- Judul pekerjaan
- Status lowongan
- Jumlah pekerja yang dibutuhkan
- Total pelamar
- Jumlah pekerja yang diterima
- Progress posisi terisi

Contoh:

- Dibutuhkan: 2 pekerja
- Total pelamar: 5
- Diterima: 1 dari 2
- Progress: 50%

Setiap card atau row pelamar menampilkan:

- Foto atau avatar
- Nama
- Trust Score
- Label Trust Score
- Rating
- Jumlah pekerjaan selesai
- Lokasi
- Keahlian utama
- Tanggal melamar
- Status lamaran

Tombol:

- Lihat Profil
- Hubungi via WhatsApp
- Tolak
- Terima Pekerja

Hierarki tombol:

- “Terima Pekerja”: primary hijau.
- “Tolak”: outline merah.
- “Lihat Profil”: secondary atau outline.
- “Hubungi via WhatsApp”: secondary hijau.

HALAMAN 4 — DETAIL PELAMAR

Buat detail page, modal besar, atau drawer sesuai pola project.

Tampilkan:

- Identitas pekerja
- Lokasi
- Trust Score
- Rating
- Jumlah pekerjaan selesai
- Persentase penyelesaian
- Keahlian
- Deskripsi
- Riwayat pekerjaan
- Sertifikat Kerja Digital
- Ulasan UMKM sebelumnya
- Portofolio

Tetap sediakan:

- Hubungi via WhatsApp
- Tolak
- Terima Pekerja

MODAL TERIMA PEKERJA

Ketika “Terima Pekerja” ditekan, tampilkan modal:

Judul:
“Terima Dimas Pratama?”

Deskripsi:
“Dimas akan mengisi 1 dari 2 posisi untuk pekerjaan Buruh Cuci Kain Batik.”

Ringkasan:

- Tanggal: 25–27 Juli 2026
- Durasi: 3 hari
- Upah: Rp120.000/hari
- Estimasi total upah: Rp360.000
- Posisi setelah diterima: 2 dari 2

Tombol:

- Batal
- Ya, Terima Pekerja

Setelah berhasil:

- Update status pelamar menjadi Diterima.
- Update jumlah posisi terisi.
- Tampilkan toast:
  “Dimas Pratama berhasil diterima.”

KUOTA PENUH

Jika posisi terisi sama dengan jumlah pekerja yang dibutuhkan:

- Status lowongan menjadi “Kuota Penuh”.
- Tampilkan “2 dari 2 posisi telah terisi”.
- Nonaktifkan tombol “Terima Pekerja” untuk pelamar lain.
- Tampilkan tooltip:
  “Semua posisi sudah terisi.”

UMKM tetap bisa:

- Melihat profil.
- Menghubungi pelamar.
- Menolak pelamar.
- Membatalkan pekerja yang diterima sebelum pekerjaan dimulai.

Jika pekerja yang diterima dibatalkan, posisi kembali tersedia.

DETAIL PEKERJA DITERIMA

Buat detail pengelolaan pekerja yang telah diterima.

Urutan status:

1. Diterima
2. Akan Dimulai
3. Sedang Berlangsung
4. Perlu Konfirmasi
5. Menunggu Konfirmasi Pekerja
6. Selesai

Tampilkan timeline status.

Jangan langsung mengubah status dari Diterima menjadi Perlu Konfirmasi.

Aturan:

- Sebelum tanggal mulai: Akan Dimulai.
- Saat berada di antara tanggal mulai dan selesai: Sedang Berlangsung.
- Setelah tanggal selesai: Perlu Konfirmasi.
- Setelah UMKM mengonfirmasi tetapi pekerja belum: Menunggu Konfirmasi Pekerja.
- Setelah kedua pihak mengonfirmasi: Selesai.

KONFIRMASI DUA PIHAK

Setelah tanggal selesai, tampilkan:

“Konfirmasi Penyelesaian Pekerjaan”

Deskripsi:

“Kedua pihak harus mengonfirmasi bahwa pekerjaan telah selesai sebelum Sertifikat Kerja Digital dan fitur rating tersedia.”

Tampilkan status dua pihak:

- UMKM
- Pekerja

State yang harus didukung:

A. Belum ada yang mengonfirmasi

- UMKM: Belum konfirmasi
- Pekerja: Belum konfirmasi
- Tombol UMKM: Konfirmasi Pekerjaan Selesai

B. UMKM sudah mengonfirmasi

- UMKM: Sudah konfirmasi
- Pekerja: Belum konfirmasi
- Pesan:
  “Konfirmasi Anda telah tercatat. Menunggu konfirmasi dari pekerja.”
- Tombol konfirmasi UMKM hilang atau disabled.

C. Pekerja sudah mengonfirmasi lebih dahulu

- UMKM: Belum konfirmasi
- Pekerja: Sudah konfirmasi
- Tombol UMKM tetap tersedia.

D. Kedua pihak sudah mengonfirmasi

- UMKM: Sudah konfirmasi
- Pekerja: Sudah konfirmasi
- Status otomatis menjadi Selesai.

Saat kedua pihak sudah mengonfirmasi:

- Terbitkan Sertifikat Kerja Digital.
- Tambahkan pekerjaan ke portofolio pekerja.
- Perbarui Trust Score.
- Tambahkan PullPoints.
- Buka form rating.

Pastikan konfirmasi bersifat idempotent dan tidak dapat dikirim berulang kali.

RATING PEKERJA

Setelah kedua pihak mengonfirmasi, tampilkan modal rating.

Field:

- Rating 1–5 bintang
- Tag penilaian
- Ulasan opsional

Tag:

- Datang tepat waktu
- Komunikasi baik
- Bertanggung jawab
- Pekerjaan sesuai deskripsi
- Hasil kerja memuaskan
- Bersedia bekerja lagi

Tombol:

- Lewati
- Kirim Rating

Toast:

“Rating berhasil dikirim. Trust Score pekerja diperbarui.”

DATA DAN BUSINESS LOGIC

Gunakan struktur data dan backend yang sudah ada jika memungkinkan.

Jika schema belum mendukung alur tersebut, buat migration yang aman.

Model data minimal perlu mendukung:

JobPosting:
- id
- ownerId
- title
- category
- location
- wagePerDay
- startDate
- endDate
- workerQuota
- status
- description
- requirements
- whatsappContact
- createdAt
- updatedAt

JobApplication:
- id
- jobId
- workerId
- status
- appliedAt
- acceptedAt
- rejectedAt

JobAssignment atau AcceptedWorker:
- id
- jobId
- workerId
- status
- employerConfirmedAt
- workerConfirmedAt
- completedAt

Rating:
- id
- jobAssignmentId
- reviewerId
- revieweeId
- stars
- tags
- review
- createdAt

Sesuaikan nama model dengan konvensi project. Jangan membuat tabel duplikat jika struktur yang setara sudah tersedia.

Status harus menggunakan enum atau konstanta terpusat, bukan string acak tersebar di banyak komponen.

WHATSAPP

Saat tombol WhatsApp ditekan:

1. Pastikan lamaran sudah tersimpan.
2. Buka WhatsApp dengan pesan awal yang relevan.
3. Jangan otomatis menerima pelamar.
4. Jangan mengubah status selain yang memang diperlukan.

Contoh pesan:

“Halo Dimas, saya Bu Sari dari Batik Laweyan. Saya ingin membahas lamaran Anda untuk pekerjaan Buruh Cuci Kain Batik di Pull.”

ASET VISUAL DAN GRAFIS

Gunakan icon library yang sudah tersedia di project terlebih dahulu.

Jika diperlukan, buat aset lokal:

- Empty state lowongan.
- Empty state pelamar.
- Ilustrasi pekerjaan selesai.
- Ikon sertifikat.
- Ikon konfirmasi dua pihak.
- Timeline marker.

Prioritaskan SVG agar ringan dan mudah disesuaikan.

Simpan aset di folder project, bukan menggunakan URL gambar eksternal.

Gunakan nama file yang jelas, misalnya:

- empty-job-posting.svg
- empty-applicants.svg
- work-completed.svg
- dual-confirmation.svg
- digital-certificate.svg

Pastikan semua SVG:

- Memiliki viewBox.
- Responsive.
- Tidak mengandung script.
- Menggunakan warna yang sesuai dengan design token Pull.
- Memiliki alt text saat digunakan.

Jangan membuat gambar foto manusia palsu. Gunakan avatar, inisial, atau data gambar yang sudah ada.

ACCESSIBILITY

- Gunakan semantic HTML.
- Tambahkan label pada form.
- Pastikan navigasi keyboard berfungsi.
- Modal harus memiliki focus trap.
- Tombol disabled harus jelas.
- Icon-only button harus memiliki aria-label.
- Warna status tidak boleh menjadi satu-satunya pembeda.
- Tambahkan teks pada badge status.
- Pastikan contrast cukup.

RESPONSIVE

Desktop:

- Sidebar tetap terlihat.
- Tabel untuk daftar lowongan.
- Grid atau table untuk pelamar.

Mobile:

- Gunakan hamburger navigation jika pola tersebut sudah tersedia.
- Tabel berubah menjadi card.
- Action button dapat masuk ke menu atau bottom sheet.
- Tombol utama tetap mudah dijangkau.
- Jangan menyebabkan horizontal overflow.

TESTING

Setelah implementasi:

1. Jalankan formatter.
2. Jalankan lint.
3. Jalankan type-check.
4. Jalankan test yang tersedia.
5. Jalankan production build.
6. Perbaiki error yang disebabkan perubahan.
7. Tambahkan test untuk business logic penting jika testing framework tersedia.

Minimal uji kondisi:

- Membuat draft.
- Memposting lowongan.
- Pelamar tampil.
- WhatsApp tidak menerima pekerja otomatis.
- UMKM menerima pekerja.
- Kuota penuh menonaktifkan penerimaan baru.
- Pembatalan membuka kembali posisi.
- Konfirmasi tidak dapat dilakukan sebelum tanggal selesai.
- Konfirmasi hanya dapat dilakukan satu kali.
- Rating belum tersedia sebelum kedua pihak mengonfirmasi.
- Rating terbuka setelah kedua pihak mengonfirmasi.

HASIL AKHIR

Setelah selesai, berikan laporan ringkas:

1. File yang dibuat.
2. File yang diubah.
3. Perubahan database atau migration.
4. Route baru.
5. Komponen reusable baru.
6. Aset SVG baru.
7. Test dan build yang dijalankan.
8. Error atau keterbatasan yang masih tersisa.
9. Langkah untuk menjalankan dan mengecek fitur.

Jangan hanya membuat mockup statis.

Implementasikan alur, state, interaksi, validasi, responsive UI, dan business logic secara nyata sesuai kemampuan backend project saat ini.
Sebelum dikirim, lampirkan juga tiga gambar referensi tersebut dan arahkan Codex ke folder root proyek. Gunakan mode yang mengizinkan Codex mengedit file; tetap periksa diff sebelum perubahan digabungkan.


Kalau gak ada design namun dia menyesuaikan saja design dan style yang sudah ada di codebase

Bisa. Malah untuk Codex, instruksinya lebih aman dibuat seperti ini: jangan membuat design system baru, tetapi audit dulu UI yang sudah ada lalu mengikuti pola komponen, warna, spacing, typography, dan struktur layout dari codebase.

Kamu bisa mengganti bagian desain pada prompt sebelumnya dengan bagian berikut:

DESAIN DAN STYLE

Tidak ada desain atau mockup baru yang dilampirkan.

Jangan membuat gaya visual baru dari nol.

Pelajari terlebih dahulu seluruh design system dan pola UI yang sudah digunakan di codebase, kemudian buat fitur baru dengan style yang konsisten dengan halaman yang sudah ada.

Sebelum membuat komponen baru, audit hal berikut:

1. Layout dashboard yang sudah digunakan.
2. Struktur sidebar, navbar, header, breadcrumb, dan content container.
3. Warna utama, warna sekunder, warna status, dan background.
4. Typography, ukuran heading, body text, label, dan caption.
5. Spacing, padding, gap, border radius, shadow, dan border.
6. Style tombol primary, secondary, outline, destructive, disabled, dan icon button.
7. Style form input, select, textarea, date picker, modal, drawer, toast, badge, table, card, tabs, pagination, tooltip, dan empty state.
8. Breakpoint responsive yang sudah digunakan.
9. Icon library yang sudah terpasang.
10. Komponen reusable yang sudah tersedia.

ATURAN IMPLEMENTASI UI

- Gunakan komponen existing terlebih dahulu.
- Jangan menduplikasi komponen jika fungsi serupa sudah tersedia.
- Jangan memperkenalkan design system baru.
- Jangan mengganti framework CSS atau UI library.
- Jangan mengubah global theme kecuali benar-benar diperlukan.
- Jangan menambahkan dependency UI baru jika komponen existing sudah cukup.
- Jangan mengubah style halaman lain yang tidak terkait.
- Gunakan token warna, spacing, radius, shadow, dan typography yang sudah ada.
- Gunakan pola layout yang sama dengan halaman dashboard lain.
- Gunakan pola responsif yang sama dengan halaman existing.
- Pertahankan konsistensi dark mode jika project sudah mendukungnya.
- Pertahankan accessibility pattern yang sudah digunakan.

Jika project memakai Tailwind CSS:

- Gunakan utility class dan konfigurasi theme yang sudah ada.
- Hindari hard-coded hex color jika token warna tersedia.
- Gunakan class atau helper existing seperti cn(), cva(), atau variant system jika tersedia.

Jika project memakai CSS Modules, styled-components, Sass, Material UI, Chakra UI, Ant Design, shadcn/ui, Bootstrap, atau library lain:

- Ikuti pola implementasi yang sudah ada.
- Jangan mencampur pendekatan styling baru tanpa alasan teknis yang kuat.

REFERENSI VISUAL DARI CODEBASE

Cari halaman yang paling mendekati kebutuhan fitur ini, misalnya:

- Halaman daftar atau tabel.
- Halaman detail.
- Halaman form.
- Halaman profil.
- Modal konfirmasi.
- Toast sukses.
- Empty state.
- Timeline atau progress.
- Dashboard transaksi.

Gunakan halaman tersebut sebagai referensi visual internal.

Contoh:

- Jika halaman transaksi menggunakan table dengan filter di atas, gunakan pola yang sama untuk Lowongan Saya.
- Jika halaman profil menggunakan drawer, gunakan drawer untuk Detail Pelamar.
- Jika project lebih sering menggunakan halaman terpisah daripada modal besar, gunakan halaman terpisah.
- Jika mobile memakai card sebagai pengganti tabel, ikuti pola tersebut.
- Jika aksi row memakai dropdown menu, jangan memaksakan semua tombol tampil sekaligus.

Jangan membuat layout berdasarkan asumsi semata. Sesuaikan keputusan UI dengan pola dominan dalam repository.

KEPUTUSAN KOMPONEN

Pilih bentuk komponen berdasarkan design pattern project:

- Lowongan Saya:
  gunakan table, data grid, atau card list sesuai pola existing.

- Daftar Pelamar:
  gunakan table, card, atau list row sesuai pola existing.

- Detail Pelamar:
  gunakan page, modal, drawer, atau sheet sesuai pola existing.

- Posting Lowongan:
  gunakan page atau dialog sesuai pola form existing.

- Konfirmasi Terima Pekerja:
  gunakan confirmation dialog existing.

- Konfirmasi Dua Pihak:
  gunakan card status, stepper, atau timeline existing.

- Rating:
  gunakan modal atau form pattern existing.

Jika tidak ada komponen yang benar-benar sesuai, buat reusable component baru dengan style yang mengikuti komponen existing.

ASET VISUAL

Jangan membuat ilustrasi atau gambar baru jika halaman existing tidak menggunakan ilustrasi.

Untuk kebutuhan visual:

1. Gunakan icon library yang sudah terpasang.
2. Gunakan avatar existing atau avatar berbasis inisial.
3. Gunakan CSS, icon, badge, progress bar, dan layout components.
4. Buat SVG lokal hanya jika benar-benar diperlukan untuk empty state atau sertifikat.
5. SVG baru harus mengikuti warna dan gaya icon existing.
6. Jangan mengambil gambar dari internet.
7. Jangan menggunakan gambar AI eksternal.
8. Jangan menambahkan aset dekoratif yang tidak konsisten dengan aplikasi.

PRIORITAS KONSISTENSI

Urutan prioritas:

1. Reuse komponen existing.
2. Reuse design token existing.
3. Reuse layout pattern existing.
4. Reuse interaction pattern existing.
5. Baru membuat komponen atau aset baru jika belum tersedia.

FITUR HARUS TERASA SEPERTI BAGIAN ASLI APLIKASI

Hasil akhirnya tidak boleh terlihat seperti halaman dari template berbeda.

Pastikan:

- Sidebar dan header tetap konsisten.
- Lebar content container sama.
- Heading hierarchy sama.
- Posisi filter dan action sama dengan halaman serupa.
- Style badge status sama.
- Style modal dan toast sama.
- Loading state dan error state mengikuti pola existing.
- Mobile navigation tetap menggunakan mekanisme existing.
Lalu pada awal prompt Codex, tambahkan instruksi ini:

Tidak ada file desain yang menjadi sumber utama.

Gunakan codebase sebagai sumber kebenaran untuk keputusan UI dan styling.

Audit dahulu halaman, komponen, dan design token yang sudah ada, lalu implementasikan fitur Papan Loker UMKM agar terlihat sebagai bagian asli dari aplikasi.

Jangan berhenti hanya karena tidak ada desain. Ambil keputusan berdasarkan pola UI dominan yang sudah ada di repository.
Bagian hasil akhirnya juga sebaiknya ditambahkan:

Pada laporan akhir, jelaskan:

- Halaman existing apa saja yang dijadikan referensi visual.
- Komponen existing apa saja yang digunakan ulang.
- Komponen baru apa saja yang dibuat.
- Alasan memilih page, modal, drawer, table, atau card.
- Apakah ada style hard-coded baru.
- Apakah ada dependency baru.
- Apakah perubahan memengaruhi halaman lain.
Jadi kamu tidak perlu meminta Codex menghasilkan gambar dulu. Suruh dia langsung membaca codebase, mengikuti design system yang ada, lalu mengimplementasikan fiturnya.


image(24).png
image(25).png
image(26).png

Pasted text(9).txt
Document
Ini hasil designya dari pasted text bagaimana saya taruh pada codex agar dia mengerti ini semuanya

Worked for 55s
Bisa. Supaya Codex tidak salah membaca tiga gambar itu sebagai satu halaman besar, berikan paket referensi yang terstruktur: tiga gambar sebagai acuan visual, satu file teks sebagai aturan bisnis, lalu satu prompt implementasi.

Codex dapat menerima screenshot atau diagram sebagai konteks, membaca repository, mengedit file, menjalankan perintah, serta melakukan lint, type-check, dan test. 

1. Masukkan file ke repository
Lebih aman simpan referensinya di dalam repository agar Codex dapat membacanya kembali selama pengerjaan.

Buat struktur seperti ini:

docs/
└── design-reference/
    ├── umkm-recruitment-spec.md
    ├── umkm-batch-1-screen-1-3.png
    ├── umkm-batch-2-screen-4-6.png
    └── umkm-batch-3-screen-7-10.png
Rename file kamu:

image(24).png
→ umkm-batch-1-screen-1-3.png

image(25).png
→ umkm-batch-2-screen-4-6.png

image(26).png
→ umkm-batch-3-screen-7-10.png

Pasted text(9).txt
→ umkm-recruitment-spec.md
File teks tersebut sudah menjelaskan aturan penting bahwa tombol WhatsApp tidak menerima pekerja secara otomatis dan istilah UI yang digunakan adalah Konfirmasi Dua Pihak. 

 File itu juga memetakan seluruh desain menjadi UMKM 1 sampai UMKM 10. 


Kalau memakai aplikasi Codex, kamu juga bisa langsung melampirkan ketiga gambar dan file teks dalam task yang sama. Pilih folder atau repository tempat Codex akan bekerja terlebih dahulu. 

2. Berikan urutan prioritas yang jelas
Codex perlu tahu mana yang menjadi sumber kebenaran:

Codebase existing: teknologi, routing, komponen, dan design system.

File spesifikasi teks: business logic dan aturan status.

Tiga gambar: susunan visual, konten, dan state yang harus tersedia.

Jika visual bertentangan dengan business logic, ikuti spesifikasi teks.

Jika visual bertentangan dengan design system existing, adaptasikan ke style codebase.

Artinya, Codex tidak harus menyalin gambar secara pixel-perfect, tetapi fitur dan alurnya harus sama.

3. Prompt utama untuk Codex
Salin prompt berikut setelah semua file dimasukkan:

Implementasikan ulang dan lengkapi alur rekrutmen khusus dashboard UMKM pada fitur Papan Loker di repository ini.

KERJAKAN LANGSUNG PADA CODEBASE

Jangan hanya memberikan contoh kode, tutorial, atau rencana. Audit repository, implementasikan perubahan, jalankan project, lalu validasi hasilnya.

REFERENSI YANG WAJIB DIBACA

1. Business logic dan detail screen:
   docs/design-reference/umkm-recruitment-spec.md

2. Visual Batch 1 — Screen UMKM 1–3:
   docs/design-reference/umkm-batch-1-screen-1-3.png

3. Visual Batch 2 — Screen UMKM 4–6:
   docs/design-reference/umkm-batch-2-screen-4-6.png

4. Visual Batch 3 — Screen UMKM 7–10:
   docs/design-reference/umkm-batch-3-screen-7-10.png

Jangan menganggap ketiga gambar tersebut sebagai satu halaman.

Ketiga gambar tersebut adalah kumpulan halaman, modal, responsive state, empty state, toast, badge, dan status yang saling terhubung dalam satu alur rekrutmen.

URUTAN PRIORITAS

Gunakan prioritas berikut ketika mengambil keputusan:

1. Arsitektur dan teknologi repository yang sudah ada.
2. Business logic pada umkm-recruitment-spec.md.
3. Struktur layar dan state pada gambar referensi.
4. Design system dan pola UI existing di codebase.

Jika terdapat perbedaan:

- Business logic pada file spesifikasi mengalahkan teks atau state yang keliru pada gambar.
- Style codebase existing mengalahkan detail dekoratif pada gambar.
- Jangan membuat design system baru.
- Jangan mengganti framework CSS atau UI library.
- Jangan menambahkan dependency baru jika komponen existing sudah mencukupi.

SCOPE

Kerjakan hanya dashboard UMKM atau pemberi kerja.

Jangan membuat ulang dashboard pekerja pada tahap ini, kecuali perubahan shared type, API, database, atau state memang dibutuhkan agar alur UMKM dapat berfungsi.

Jangan merusak:

- Pool Patungan
- Profil Usaha
- Trust Score
- PullPoints
- Autentikasi
- Navigasi
- Dashboard pekerja existing
- Fitur lain di luar Papan Loker

TAHAP AUDIT

Sebelum mengedit, periksa:

1. Framework, package manager, dan struktur repository.
2. Route dashboard UMKM.
3. Route Papan Loker dan Lowongan Saya existing.
4. Komponen reusable untuk table, card, form, modal, drawer, tabs, badge, toast, tooltip, progress bar, pagination, dan empty state.
5. Design token untuk warna, typography, spacing, radius, border, dan shadow.
6. Icon library existing.
7. State management dan data fetching.
8. Database atau mock data yang digunakan.
9. Pola responsive desktop dan mobile.
10. Test framework yang tersedia.

Setelah audit, langsung implementasikan tanpa menunggu persetujuan tambahan.

PEMETAAN SCREEN

Batch 1:

UMKM 1 — Lowongan Saya
- Daftar lowongan milik UMKM.
- Filter dan tab status.
- Desktop menggunakan pola table existing.
- Mobile menggunakan pola card existing.
- Jumlah pelamar dan posisi terisi harus dipisahkan.
- Jangan gunakan angka ambigu seperti “4/5”.

UMKM 2 — Posting Lowongan
- Form posting lowongan.
- Mendukung Simpan sebagai Draft dan Posting Lowongan.
- Validasi field wajib.
- Menampilkan pesan error dan toast sukses.

UMKM 3 — Daftar Pelamar
- Informasi kebutuhan pekerja, total pelamar, dan posisi terisi.
- Progress posisi.
- Card atau row pelamar.
- Aksi Lihat Profil, Hubungi via WhatsApp, Terima Pekerja, dan Tolak.

Batch 2:

UMKM 4 — Detail Pelamar
- Profil pekerja.
- Trust Score.
- Rating.
- Keahlian.
- Performa.
- Riwayat pekerjaan.
- Ulasan.
- Sertifikat atau portofolio jika datanya tersedia.

UMKM 5 — Terima Pekerja
- Confirmation modal.
- Ringkasan posisi sebelum dan sesudah pekerja diterima.
- Tombol Batal dan Ya, Terima Pekerja.
- Setelah berhasil, update status dan tampilkan toast.

UMKM 6 — Kuota Penuh
- Aktif ketika accepted worker sama dengan worker quota.
- Tombol menerima pelamar tambahan menjadi disabled.
- Informasi kuota penuh harus jelas.
- UMKM tetap dapat melihat pelamar dan profil.
- Jika pekerja diterima dibatalkan sebelum mulai, posisi kembali tersedia.

Batch 3:

UMKM 7 — Pekerja Diterima
- Menampilkan pekerja yang diterima.
- Detail pekerjaan dan total upah.
- Status Akan Dimulai atau Sedang Berlangsung sesuai tanggal.
- Tombol WhatsApp, Lihat Profil, dan tindakan lanjutan.

UMKM 8 — Konfirmasi Dua Pihak
- Menampilkan status konfirmasi UMKM dan pekerja secara terpisah.
- Konfirmasi hanya dapat dilakukan satu kali oleh masing-masing pihak.
- Konfirmasi tidak tersedia sebelum pekerjaan selesai.
- Setelah UMKM mengonfirmasi, tombol harus hilang atau disabled.
- Pekerjaan selesai hanya jika kedua pihak sudah mengonfirmasi.

UMKM 9 — Pekerjaan Selesai
- Success state setelah konfirmasi kedua pihak.
- Menampilkan ringkasan pekerjaan.
- Membuka tindakan Beri Rating.
- Sertifikat, PullPoints, Trust Score, dan riwayat hanya diperbarui sesuai business logic yang tersedia.

UMKM 10 — Rating Pekerja
- Rating keseluruhan.
- Ulasan opsional.
- Penilaian aspek atau tag sesuai desain.
- Tombol Lewati dan Kirim Rating.
- Rating tidak dapat dikirim dua kali untuk assignment yang sama.

ATURAN BUSINESS LOGIC UTAMA

1. Menghubungi melalui WhatsApp tidak sama dengan menerima pekerja.

2. Tombol WhatsApp hanya membuka komunikasi dan tidak boleh mengubah application status.

3. Status menjadi Diterima hanya setelah UMKM menekan Terima Pekerja dan menyetujui confirmation modal.

4. Pisahkan:
   - total pelamar;
   - worker quota;
   - jumlah pekerja diterima.

5. Status pekerjaan harus berjalan bertahap:
   - Draft
   - Terbuka
   - Hampir Penuh
   - Kuota Penuh
   - Akan Dimulai
   - Sedang Berlangsung
   - Perlu Konfirmasi
   - Selesai
   - Dibatalkan

6. Jangan gunakan istilah “Confirmation Loop” pada UI.

7. Gunakan istilah “Konfirmasi Dua Pihak”.

8. Konfirmasi tidak boleh dilakukan sebelum end date.

9. Konfirmasi harus idempotent dan tidak dapat dikirim berulang kali.

10. Rating hanya terbuka setelah kedua pihak mengonfirmasi.

11. Rating hanya dapat dikirim satu kali oleh UMKM untuk pekerja dan assignment yang sama.

DESIGN SYSTEM

Jangan menyalin gambar secara pixel-perfect apabila bertentangan dengan codebase.

Gunakan codebase sebagai sumber style utama:

- Reuse layout dashboard existing.
- Reuse sidebar dan header existing.
- Reuse button variant existing.
- Reuse form component existing.
- Reuse badge, toast, modal, card, table, tabs, dan pagination existing.
- Reuse responsive breakpoint existing.
- Reuse icon library existing.
- Jangan hard-code warna jika design token tersedia.
- Jangan memasukkan seluruh tombol ke satu row jika codebase menggunakan dropdown action.
- Adaptasikan gambar agar terlihat seperti bagian asli aplikasi.

Gambar referensi digunakan untuk memahami:

- Information hierarchy.
- Susunan konten.
- Screen yang diperlukan.
- State yang diperlukan.
- Responsive behavior.
- Hubungan antarhalaman.
- Copywriting utama.

ROUTING

Ikuti struktur route yang sudah digunakan project.

Jangan memaksakan nama route tertentu jika codebase memiliki konvensi berbeda.

Pastikan seluruh alur dapat dinavigasi:

Lowongan Saya
→ Posting Lowongan
→ Daftar Pelamar
→ Detail Pelamar
→ Terima Pekerja
→ Kuota Penuh
→ Pekerja Diterima
→ Konfirmasi Dua Pihak
→ Pekerjaan Selesai
→ Rating Pekerja

DATA

Gunakan model dan API existing jika tersedia.

Jangan membuat data model duplikat.

Jika backend belum mendukung semuanya:

- Implementasikan bagian yang dapat menggunakan struktur existing.
- Buat type dan service abstraction yang konsisten.
- Gunakan mock data hanya jika project memang masih menggunakan mock data.
- Jangan mengganti data nyata dengan mock data.
- Dokumentasikan backend gap yang belum dapat diselesaikan.

Jika repository sudah menggunakan migration dan perubahan schema memang dibutuhkan, buat migration yang aman dan konsisten dengan pola repository.

ASET DAN GRAFIS

Gunakan icon library dan aset existing terlebih dahulu.

Jangan membuat gambar AI atau mengambil gambar dari internet.

Buat SVG lokal hanya apabila benar-benar dibutuhkan untuk:

- Empty state lowongan.
- Empty state pelamar.
- Success state pekerjaan.
- Sertifikat atau konfirmasi dua pihak.

Semua aset harus:

- Disimpan di folder aset existing.
- Memiliki nama yang jelas.
- Responsive.
- Memiliki viewBox jika SVG.
- Tidak mengandung script.
- Memiliki alt text saat digunakan.

RESPONSIVE

Implementasikan desktop dan mobile berdasarkan gambar, tetapi ikuti breakpoint codebase.

Pastikan:

- Tidak ada horizontal overflow.
- Table berubah menjadi card atau layout mobile sesuai pola existing.
- Action penting tetap mudah dijangkau.
- Modal mobile tidak keluar dari viewport.
- Form tetap dapat digunakan pada layar kecil.
- Sidebar atau bottom navigation mengikuti implementasi existing.

ACCESSIBILITY

- Label form harus terhubung dengan input.
- Icon-only button memiliki aria-label.
- Modal mendukung keyboard dan focus management.
- Badge memiliki teks, bukan hanya warna.
- Disabled state terlihat jelas.
- Error form dapat dibaca screen reader.
- Warna memiliki contrast yang cukup.

VALIDASI VISUAL

Setelah implementasi:

1. Jalankan aplikasi.
2. Buka seluruh screen UMKM 1–10.
3. Periksa desktop dan mobile.
4. Bandingkan hierarchy dan state dengan gambar referensi.
5. Pastikan style tetap konsisten dengan codebase.
6. Perbaiki overflow, spacing, alignment, dan state yang tidak sesuai.
7. Jangan menganggap selesai hanya karena build berhasil.

TESTING

Jalankan yang tersedia:

- Formatter
- Lint
- Type-check
- Unit test
- Integration test
- Production build

Tambahkan test untuk business logic penting jika test framework tersedia:

- WhatsApp tidak menerima pekerja otomatis.
- Menerima pekerja memperbarui posisi terisi.
- Kuota penuh mencegah penerimaan tambahan.
- Membatalkan pekerja membuka posisi kembali.
- Konfirmasi tidak tersedia sebelum end date.
- Konfirmasi tidak dapat dikirim dua kali.
- Selesai membutuhkan konfirmasi dua pihak.
- Rating terkunci sebelum selesai.
- Rating tidak dapat dikirim dua kali.

LAPORAN AKHIR

Setelah selesai, jelaskan:

1. File yang dibuat.
2. File yang diubah.
3. Route yang dibuat atau diubah.
4. Komponen existing yang digunakan ulang.
5. Komponen baru yang dibuat.
6. Perubahan schema atau migration.
7. Aset baru yang dibuat.
8. Test, lint, type-check, dan build yang dijalankan.
9. Halaman yang digunakan sebagai referensi style internal.
10. Keterbatasan atau backend gap yang masih tersisa.

Jangan hanya mengimplementasikan tampilan statis.

Pastikan interaksi, state transition, validation, responsive layout, dan business logic berfungsi.
4. Sebaiknya dikerjakan per batch
Agar Codex lebih fokus, setelah memberikan prompt utama, kamu bisa meminta pengerjaan bertahap.

Task pertama
Mulai dari Batch 1 saja: UMKM 1–3.

Implementasikan Lowongan Saya, Posting Lowongan, dan Daftar Pelamar sampai berfungsi. Jangan mengerjakan Batch 2 dan Batch 3 terlebih dahulu.

Setelah selesai, jalankan lint, type-check, test, dan build. Berikan daftar file yang berubah serta hal yang perlu diperiksa secara visual.
Setelah kamu mengecek hasilnya:

Lanjutkan Batch 2: UMKM 4–6 dengan menggunakan implementasi Batch 1 yang sudah ada. Jangan mengubah desain atau business logic Batch 1 kecuali diperlukan untuk integrasi.
Kemudian:

Lanjutkan Batch 3: UMKM 7–10. Implementasikan state pekerjaan, Konfirmasi Dua Pihak, penyelesaian, dan rating. Pastikan seluruh alur dari Batch 1 sampai Batch 3 terhubung.
Metode batch biasanya lebih aman daripada meminta sepuluh screen, backend state, dan responsive layout selesai sekaligus.

5. Hal yang perlu kamu cek setelah Codex selesai
Pastikan Codex tidak hanya membuat tampilan:

Tombol WhatsApp tidak mengubah status.

Tombol Terima Pekerja benar-benar memperbarui posisi.

Kuota penuh benar-benar mencegah penerimaan tambahan.

Konfirmasi baru tersedia setelah pekerjaan selesai.

Setiap pihak hanya dapat konfirmasi sekali.

Rating baru tersedia setelah dua pihak mengonfirmasi.

Tampilan mobile bukan sekadar desktop yang diperkecil.

Style tetap cocok dengan halaman lain dalam aplikasi.


Alur dasarnya tetap mengikuti proposal: pekerja diarahkan ke WhatsApp untuk komunikasi, tetapi penyelesaian pekerjaan, konfirmasi dua pihak, rating, dan rekam jejak tetap dilakukan di Pull. Rating, Trust Score, PullPoints, dan sertifikat baru diproses setelah kedua pihak mengonfirmasi.

Salin prompt berikut ke AI desain:

Tolong buat ulang dari nol desain UI/UX fitur Papan Loker khusus dashboard pengguna UMKM pada platform bernama “Pull”.

Gunakan gambar referensi yang saya lampirkan sebagai acuan identitas visual, tetapi perbaiki alur rekrutmen agar lebih jelas, konsisten, dan tidak membingungkan.

Untuk sekarang, buat hanya alur dari sisi UMKM atau pemberi kerja. Jangan buat dashboard pekerja terlebih dahulu.

TUJUAN DESAIN

Dashboard UMKM harus memungkinkan pemilik usaha:

1. Memposting lowongan kerja harian.
2. Melihat daftar pelamar.
3. Membuka profil dan rekam jejak pelamar.
4. Menghubungi pelamar melalui WhatsApp.
5. Memilih pelamar dengan tombol “Terima Pekerja”.
6. Menolak pelamar dengan tombol “Tolak”.
7. Melihat jumlah posisi yang sudah terisi.
8. Memantau pekerjaan yang sedang berlangsung.
9. Melakukan konfirmasi setelah pekerjaan selesai.
10. Memberikan rating setelah kedua pihak mengonfirmasi pekerjaan.

PENTING

Menghubungi melalui WhatsApp tidak sama dengan menerima pekerja.

Tombol “Hubungi via WhatsApp” hanya digunakan untuk berdiskusi atau mengonfirmasi detail pekerjaan. Tombol tersebut tidak boleh otomatis mengubah status pelamar.

UMKM tetap harus menekan tombol “Terima Pekerja” agar status pelamar berubah menjadi diterima.

Jangan gunakan istilah “Confirmation Loop” pada tampilan pengguna. Gunakan istilah yang lebih mudah dipahami:

“Konfirmasi Dua Pihak”

GAYA VISUAL

Pertahankan identitas visual platform Pull:

- Nama platform: Pull
- Warna utama: hijau tua
- Warna dasar: putih
- Warna aksen: kuning atau oranye
- Gunakan prinsip warna 60–30–10:
  - 60% putih
  - 30% hijau
  - 10% kuning atau oranye
- Tampilan modern, profesional, bersih, dan mudah digunakan UMKM.
- Gunakan card, badge status, progress indicator, modal, toast notification, dan empty state.
- Pertahankan sidebar hijau seperti pada desain referensi.
- Buat versi desktop dan mobile.
- Gunakan spacing yang lebih lega dan jangan membuat elemen terlalu berdempetan.
- Seluruh tombol utama harus mudah terlihat.
- Gunakan bahasa Indonesia yang sederhana.

BUAT DESAIN DALAM BEBERAPA SCREEN BERURUTAN

SCREEN 1 — LOWONGAN SAYA

Buat halaman utama “Lowongan Saya” untuk dashboard UMKM.

Header:

- Breadcrumb: Home / Papan Loker / Lowongan Saya
- Judul: Lowongan Saya
- Deskripsi: Kelola lowongan kerja harian yang Anda posting.
- Tombol utama: “+ Posting Lowongan”

Tambahkan tab status:

- Semua
- Draft
- Terbuka
- Hampir Penuh
- Kuota Penuh
- Sedang Berlangsung
- Perlu Konfirmasi
- Selesai
- Dibatalkan

Tambahkan pencarian dan filter berdasarkan:

- Judul pekerjaan
- Status
- Tanggal mulai
- Lokasi

Pada desktop, tampilkan lowongan dalam bentuk tabel.

Kolom tabel:

- Judul pekerjaan
- Upah per hari
- Durasi
- Tanggal mulai
- Status
- Jumlah pelamar
- Posisi terisi
- Aksi

Contoh data:

Judul pekerjaan:
Buruh Cuci Kain Batik

Upah:
Rp120.000/hari

Durasi:
3 hari

Tanggal:
25–27 Juli 2026

Status:
Terbuka

Jumlah pelamar:
5 pelamar

Posisi terisi:
1 dari 2 pekerja

Aksi:
“Lihat Pelamar”

Jangan menggunakan format ambigu seperti “4/5” tanpa penjelasan.

Pisahkan menjadi:

- 5 pelamar
- 1 dari 2 posisi terisi

Pada mobile, ubah tabel menjadi card vertikal.

SCREEN 2 — FORM POSTING LOWONGAN

Buat form posting lowongan baru.

Field yang tersedia:

- Judul pekerjaan
- Kategori pekerjaan
- Lokasi pekerjaan
- Upah per hari
- Durasi pekerjaan
- Tanggal mulai
- Tanggal selesai
- Jumlah pekerja yang dibutuhkan
- Deskripsi pekerjaan
- Persyaratan atau keahlian
- Jam kerja
- Kontak WhatsApp yang digunakan

Tombol:

- Simpan sebagai Draft
- Posting Lowongan

Setelah berhasil diposting, tampilkan toast:

“Lowongan berhasil diposting.”

SCREEN 3 — DAFTAR PELAMAR

Ketika UMKM menekan “Lihat Pelamar”, buka halaman khusus daftar pelamar.

Header halaman:

- Judul pekerjaan: Buruh Cuci Kain Batik
- Status: Terbuka
- Dibutuhkan: 2 pekerja
- Total pelamar: 5 pelamar
- Sudah diterima: 1 dari 2 pekerja

Tambahkan progress posisi:

“1 dari 2 posisi telah terisi”

Tampilkan setiap pelamar dalam card.

Informasi card pelamar:

- Foto profil
- Nama pekerja
- Trust Score
- Label kualitas Trust Score
- Rating
- Jumlah pekerjaan yang telah selesai
- Lokasi
- Keahlian utama
- Tanggal melamar
- Status lamaran

Tombol pada setiap card:

- Lihat Profil
- Hubungi via WhatsApp
- Tolak
- Terima Pekerja

Hierarki tombol:

- “Terima Pekerja” menjadi tombol utama berwarna hijau.
- “Tolak” menjadi tombol sekunder atau outline merah.
- “Lihat Profil” menjadi tombol outline.
- “Hubungi via WhatsApp” menjadi tombol hijau muda atau tombol sekunder.

Menekan tombol WhatsApp tidak mengubah status lamaran.

SCREEN 4 — DETAIL PROFIL PELAMAR

Ketika UMKM menekan “Lihat Profil”, tampilkan halaman atau drawer detail pelamar.

Informasi yang ditampilkan:

- Foto dan nama pekerja
- Lokasi
- Trust Score
- Rating keseluruhan
- Jumlah pekerjaan selesai
- Tingkat penyelesaian pekerjaan
- Keahlian
- Deskripsi singkat
- Riwayat pekerjaan
- Sertifikat Kerja Digital
- Rating dan ulasan dari UMKM sebelumnya
- Portofolio pekerjaan

Tombol tetap tersedia:

- Hubungi via WhatsApp
- Tolak
- Terima Pekerja

SCREEN 5 — MODAL TERIMA PEKERJA

Ketika UMKM menekan “Terima Pekerja”, tampilkan modal konfirmasi.

Contoh isi modal:

Judul:
Terima Dimas Pratama?

Deskripsi:
Dimas akan mengisi 1 dari 2 posisi untuk pekerjaan Buruh Cuci Kain Batik.

Informasi ringkas:

- Tanggal kerja: 25–27 Juli 2026
- Durasi: 3 hari
- Upah: Rp120.000/hari
- Estimasi total upah: Rp360.000
- Posisi setelah diterima: 2 dari 2 posisi terisi

Tombol:

- Batal
- Ya, Terima Pekerja

Setelah diterima, tampilkan toast:

“Dimas Pratama berhasil diterima.”

Status pelamar berubah:

“Menunggu Respons” menjadi “Diterima”

SCREEN 6 — KONDISI KUOTA PENUH

Jika jumlah pekerja yang diterima sudah sama dengan jumlah yang dibutuhkan:

- Status lowongan berubah menjadi “Kuota Penuh”.
- Tampilkan informasi “2 dari 2 posisi telah terisi”.
- Tombol “Terima Pekerja” pada pelamar lain menjadi nonaktif.
- Berikan tooltip atau keterangan:
  “Semua posisi sudah terisi.”

UMKM masih dapat:

- Melihat seluruh pelamar
- Melihat profil pelamar
- Menghubungi pelamar
- Menolak pelamar
- Membatalkan pekerja yang sebelumnya diterima

Jika salah satu pekerja yang diterima dibatalkan, posisi kembali tersedia dan tombol “Terima Pekerja” aktif kembali.

SCREEN 7 — DETAIL PEKERJA YANG DITERIMA

Buat halaman pengelolaan pekerja yang telah diterima.

Status pekerjaan harus berubah secara bertahap:

1. Diterima
2. Akan Dimulai
3. Sedang Berlangsung
4. Perlu Konfirmasi
5. Menunggu Konfirmasi Pekerja
6. Selesai

Tampilkan:

- Nama pekerja
- Judul pekerjaan
- Tanggal mulai dan selesai
- Upah per hari
- Total upah
- Status pekerjaan
- Timeline status
- Tombol Hubungi via WhatsApp
- Tombol Lihat Profil
- Tombol Batalkan Pekerja, jika pekerjaan belum dimulai

Jangan langsung mengubah status dari “Diterima” menjadi “Perlu Konfirmasi”.

Sebelum tanggal mulai:
“Akan Dimulai”

Saat tanggal kerja berlangsung:
“Sedang Berlangsung”

Setelah tanggal selesai:
“Perlu Konfirmasi”

SCREEN 8 — KONFIRMASI DUA PIHAK

Setelah tanggal pekerjaan selesai, tampilkan bagian:

“Konfirmasi Penyelesaian Pekerjaan”

Berikan penjelasan:

“Kedua pihak harus mengonfirmasi bahwa pekerjaan telah selesai sebelum Sertifikat Kerja Digital dan fitur rating tersedia.”

Tampilkan dua status:

- Batik Laweyan Bu Sari — UMKM
- Dimas Pratama — Pekerja

Gunakan empat kemungkinan state:

STATE A — Belum ada yang konfirmasi

UMKM:
Belum konfirmasi

Pekerja:
Belum konfirmasi

Tombol untuk UMKM:
“Konfirmasi Pekerjaan Selesai”

STATE B — UMKM sudah konfirmasi

UMKM:
Sudah konfirmasi

Pekerja:
Belum konfirmasi

Tampilkan pesan:

“Konfirmasi Anda telah tercatat. Menunggu konfirmasi dari Dimas Pratama.”

Tombol konfirmasi UMKM harus hilang atau menjadi nonaktif agar tidak dapat ditekan berulang kali.

STATE C — Pekerja sudah konfirmasi lebih dahulu

UMKM:
Belum konfirmasi

Pekerja:
Sudah konfirmasi

Tampilkan tombol:

“Konfirmasi Pekerjaan Selesai”

STATE D — Kedua pihak sudah konfirmasi

UMKM:
Sudah konfirmasi

Pekerja:
Sudah konfirmasi

Status otomatis berubah menjadi:

“Selesai”

Sistem kemudian:

- Menerbitkan Sertifikat Kerja Digital
- Menambahkan riwayat kerja ke portofolio pekerja
- Memperbarui Trust Score kedua pihak
- Menambahkan PullPoints
- Membuka fitur rating

Konfirmasi hanya boleh dilakukan satu kali oleh masing-masing pihak.

SCREEN 9 — KONFIRMASI BERHASIL

Setelah kedua pihak mengonfirmasi, tampilkan success modal atau success page.

Judul:

“Pekerjaan Berhasil Diselesaikan!”

Isi:

- Konfirmasi kedua pihak tercatat
- Sertifikat Kerja Digital telah diterbitkan
- Trust Score diperbarui
- PullPoints ditambahkan
- Riwayat pekerjaan tersimpan

Tombol utama:

“Beri Rating untuk Dimas”

Tombol sekunder:

“Nanti Saja”

SCREEN 10 — RATING PEKERJA

Buat modal rating dari UMKM kepada pekerja.

Informasi:

- Nama pekerja
- Judul pekerjaan
- Tanggal kerja
- Rating bintang 1–5
- Pilihan tag penilaian
- Kolom ulasan

Contoh tag:

- Datang tepat waktu
- Pekerjaan sesuai deskripsi
- Komunikasi baik
- Bertanggung jawab
- Hasil kerja memuaskan
- Bersedia bekerja lagi

Tombol:

- Lewati
- Kirim Rating

Setelah rating dikirim, tampilkan toast:

“Rating berhasil dikirim. Trust Score pekerja diperbarui.”

ALUR UTAMA YANG HARUS TERLIHAT

Posting Lowongan
→ Lowongan Terbuka
→ Pekerja Melamar
→ UMKM Melihat Pelamar
→ UMKM Membuka Profil
→ UMKM Menghubungi melalui WhatsApp
→ UMKM Menekan Terima atau Tolak
→ Pekerja Diterima
→ Kuota Pekerja Terisi
→ Pekerjaan Dimulai
→ Pekerjaan Berlangsung
→ Durasi Pekerjaan Selesai
→ Konfirmasi Dua Pihak
→ Sertifikat Terbit
→ Rating Dibuka
→ Pekerjaan Selesai

PERBAIKAN DARI DESAIN SEBELUMNYA

Perbaiki hal berikut:

1. Jangan hanya menyediakan tombol WhatsApp pada daftar pelamar.
2. Tambahkan tombol jelas “Terima Pekerja” dan “Tolak”.
3. Pisahkan jumlah pelamar dengan jumlah posisi terisi.
4. Jangan menggunakan angka seperti “4/5” tanpa label.
5. Jangan langsung menampilkan tombol konfirmasi sebelum durasi kerja selesai.
6. Jangan membuat tombol konfirmasi dapat ditekan berulang kali.
7. Jangan menggunakan istilah “Confirmation Loop” pada UI.
8. Gunakan “Konfirmasi Dua Pihak”.
9. Rating hanya terbuka setelah UMKM dan pekerja sama-sama mengonfirmasi.
10. Buat status pekerjaan secara bertahap dan mudah dipahami.
11. Tampilkan setiap state secara visual, bukan menggabungkan seluruh state dalam satu layar yang membingungkan.

HASIL YANG DIMINTA

Buat satu board UI/UX lengkap khusus dashboard UMKM yang berisi:

- Versi desktop
- Versi mobile
- Screen utama
- Modal
- Empty state
- Success state
- Disabled state
- Toast notification
- Status badge
- Timeline pekerjaan

Beri label pada setiap desain:

- UMKM 1 — Lowongan Saya
- UMKM 2 — Posting Lowongan
- UMKM 3 — Daftar Pelamar
- UMKM 4 — Detail Pelamar
- UMKM 5 — Konfirmasi Terima
- UMKM 6 — Kuota Penuh
- UMKM 7 — Pekerja Diterima
- UMKM 8 — Konfirmasi Dua Pihak
- UMKM 9 — Pekerjaan Selesai
- UMKM 10 — Beri Rating

Pastikan seluruh layar saling terhubung dan memiliki alur yang konsisten.

Close
