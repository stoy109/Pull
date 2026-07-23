# Challenge 2 - Smart Impact Dashboard & Action Log

## Status

Implementasi selesai pada 23 Juli 2026 dan tersedia khusus Administrator di
`/admin/impact`. Halaman memakai data nyata dari lowongan, lamaran, penawaran
supplier, dan tindakan Administrator; tidak menggunakan data mock.

## Tujuan

Dashboard ini membantu Administrator melihat kondisi utama platform, mengukur
dampak, menemukan item yang perlu ditangani, menjalankan aksi, dan membuktikan
bahwa setiap aksi tercatat.

## Empat metrik utama

| Metrik | Definisi |
| --- | --- |
| Lowongan aktif | Lowongan berstatus `published` yang dibuat dalam periode terpilih |
| Lamaran masuk | Semua lamaran yang dibuat dalam periode terpilih |
| Tingkat penempatan | Persentase lamaran berstatus `accepted` dalam periode terpilih |
| Penawaran aktif | Penawaran supplier berstatus `active` yang dibuat dalam periode terpilih |

Filter kategori juga memengaruhi metrik. Saat kategori Supplier dipilih, metrik
rekrutmen menjadi nol; saat Rekrutmen dipilih, metrik supplier menjadi nol.

## Filter nyata

Dashboard menyediakan tiga filter yang diproses di RPC database:

- periode: 7, 30, atau 90 hari;
- kategori: semua, Rekrutmen, atau Supplier;
- prioritas: semua, Tinggi, Sedang, atau Rendah.

Filter mengubah metrik, ringkasan prioritas, rekomendasi, jumlah item, dan isi
tabel. Nilai URL yang tidak valid dinormalisasi di server dan divalidasi ulang
di database.

## Aturan prioritas dan rekomendasi

| Item | Tinggi | Sedang | Rendah |
| --- | --- | --- | --- |
| Lowongan | Aktif, tanpa pelamar, lebih dari 3 hari | Aktif dan belum memiliki pelamar | Kondisi lainnya |
| Lamaran | Menunggu lebih dari 2 hari | Masih menunggu | Sudah memiliki keputusan |
| Penawaran supplier | Aktif lebih dari 14 hari | Aktif lebih dari 7 hari | Masih baru atau tidak aktif |

Rekomendasi hanya mengambil maksimal lima item prioritas Tinggi atau Sedang
yang belum memiliki tindakan Administrator. Aturan ini bersifat deterministik
dan dapat dijelaskan saat demo; label “rule-based recommendation” ditampilkan
secara jujur pada halaman.

## Detail dan Action Log

Tabel detail memenuhi kolom wajib challenge:

- nama item;
- kategori;
- status;
- prioritas;
- waktu;
- tombol aksi.

Administrator dapat memilih **Tindak lanjuti** atau **Abaikan**. Aksi dikirim
melalui Server Action ke RPC `record_impact_action`, lalu dicatat di tabel
`impact_action_logs`. Aksi terakhir ditampilkan pada baris item dan sepuluh
aksi terbaru ditampilkan pada bagian Action Log.

Pengguna browser tidak boleh menulis langsung ke `impact_action_logs`. RLS dan
hak akses RPC memastikan hanya Administrator aktif yang dapat membaca dashboard
atau mencatat tindakan.

## Data demo yang disarankan

Sebelum presentasi, siapkan data nyata melalui dashboard masing-masing role:

1. UMKM membuat minimal dua lowongan di `/dashboard/publish`.
2. Pekerja mengirim minimal satu lamaran di `/worker/apply`.
3. Supplier membuat minimal satu penawaran di `/supplier`.
4. Administrator membuka `/admin/impact`, mengganti periode dan kategori.
5. Administrator menekan **Tindak lanjuti** pada satu item.
6. Tunjukkan bahwa tombol berubah menjadi status tindakan dan entri baru muncul
   di Action Log.

Data lama diperlukan untuk memperlihatkan prioritas berdasarkan umur. Jika data
baru semuanya berprioritas rendah/sedang, filter dan Action Log tetap dapat
dibuktikan tanpa memalsukan tanggal.

## Matriks penerimaan challenge

| Ketentuan | Implementasi |
| --- | --- |
| Dashboard terintegrasi | Membaca tiga tabel bisnis melalui RPC Supabase |
| Kondisi utama | Empat metrik dan ringkasan prioritas |
| Dampak | Tingkat penempatan dan volume aktivitas bisnis |
| Rekomendasi | Aturan berdasarkan status, umur, dan ketiadaan pelamar |
| Minimal empat metrik | Empat metrik tersedia |
| Minimal dua filter nyata | Tiga filter tersedia dan diproses database |
| Daftar detail wajib | Enam kolom wajib tersedia |
| Tombol aksi | Tindak lanjuti dan Abaikan |
| Action Log | Tabel persisten, daftar terbaru, RLS, dan RPC khusus admin |

## Verifikasi

Jalankan:

```powershell
npm run typecheck
npm run lint
npm test
npm run verify:impact
npm run build
```

`verify:impact` memastikan akses anonim ditolak, insert langsung ditolak, target
palsu ditolak, dan kontrak empat metrik dari RPC dapat dibaca Administrator.
