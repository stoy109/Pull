# RBAC Demo Account Setup

Dokumen ini menyiapkan akun demo untuk Challenge 1 setelah seluruh migration
RBAC dan Activity Monitoring diterapkan pada Supabase.

## 1. Terapkan migration

Gunakan Supabase CLI sesuai workflow project, atau salin isi migration ke SQL
Editor Supabase. Pastikan proses selesai tanpa error sebelum onboarding akun
baru diuji.

Migration yang diperlukan:

- `202607230001_challenge_1_rbac_foundation.sql`;
- `202607230002_fix_set_own_role.sql`;
- `202607230003_activity_monitoring.sql`;
- `202607230004_fix_activity_role_variables.sql`;
- `202607230005_admin_users_and_activity.sql`;
- `202607230006_persistent_role_business_actions.sql`.

Rangkaian migration tersebut:

- membuat enum role dan status akun;
- membuat tabel `public.profiles`;
- menyinkronkan profil dari `auth.users`;
- memindahkan role domain lama dari metadata;
- memasang RLS dan hak akses kolom;
- menyediakan RPC `set_own_role` yang tidak menerima role Administrator;
- membuat `activity_logs`, presence, dan agregasi monitoring;
- menyediakan query pengguna/log khusus Administrator;
- menyediakan moderasi suspend/reactivate yang tercatat otomatis.

## 2. Buat akun domain

Buat tiga akun melalui alur registrasi dan onboarding Pull:

- satu akun UMKM;
- satu akun Pekerja;
- satu akun Supplier.

Pilih role melalui onboarding. Jangan mengubah role langsung dari browser atau
menanam kredensial akun demo di source code.

## 3. Buat akun Administrator

Administrator tidak dibuat melalui onboarding publik.

1. Buat pengguna baru dari Supabase Authentication Dashboard, atau gunakan
   `node scripts/provision-admin.mjs` dengan environment lokal yang tidak
   dikomit.
2. Gunakan email internal yang memang disiapkan untuk demo.
3. Setelah pengguna tersedia, jalankan SQL berikut dengan mengganti email
   placeholder.

```sql
begin;

do $$
declare
  admin_user_id uuid;
begin
  select id into admin_user_id
  from auth.users
  where email = 'GANTI_DENGAN_EMAIL_ADMIN';

  if admin_user_id is null then
    raise exception 'Akun Administrator tidak ditemukan';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'admin')
  where id = admin_user_id;

  update public.profiles
  set role = 'admin'::public.app_role,
      account_status = 'active'::public.account_status,
      updated_at = now()
  where id = admin_user_id;

  if not found then
    raise exception 'Profil Administrator tidak ditemukan';
  end if;
end
$$;

commit;
```

Script akan membatalkan transaksi bila akun atau profil tidak ditemukan.

## 4. Verifikasi route

Setelah login, setiap akun harus diarahkan sebagai berikut:

| Role | Route |
| --- | --- |
| Administrator | `/admin` |
| UMKM | `/dashboard` |
| Pekerja | `/worker/dashboard` |
| Supplier | `/supplier` |

Halaman Administrator:

| Fitur | Route |
| --- | --- |
| Ringkasan Monitoring | `/admin` |
| Manajemen Pengguna | `/admin/users` |
| Log Aktivitas | `/admin/activity` |

Uji juga URL langsung:

- akun UMKM membuka `/admin` harus kembali ke `/dashboard`;
- akun Pekerja membuka `/admin` harus kembali ke `/worker/dashboard`;
- akun Supplier membuka `/dashboard` harus kembali ke `/supplier`;
- akun tanpa role harus kembali ke onboarding;
- akun `suspended` harus masuk ke `/account-suspended`.

## 5. Catatan keamanan

- Jangan menambahkan `admin` ke daftar role onboarding.
- Jangan memakai `user_metadata.role` untuk memberikan akses Administrator.
- Jangan memasukkan service-role key ke environment `NEXT_PUBLIC_*`.
- Jangan meng-commit password akun demo ke Git.
- Perubahan role atau status akun selanjutnya harus dilakukan melalui aksi Admin
  yang terlindungi dan tercatat pada audit log.

## 6. Verifikasi otomatis

Jalankan dari root project setelah `.env.local` dan `.env.admin.local` tersedia:

```powershell
node scripts/verify-admin-login.mjs
node scripts/verify-activity-monitoring.mjs
node scripts/verify-admin-management.mjs
```

Script hanya menampilkan status verifikasi dan jumlah ringkas; kredensial serta
key tidak dicetak ke output.
