"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  IdCard,
  LogOut,
  MapPin,
  Save,
  SlidersHorizontal,
  Smartphone,
  Store,
  UploadCloud,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { signOutAction } from "@/features/auth/actions";

type SettingsSection = "profile" | "verification" | "operations";

const sections = [
  { id: "profile", label: "Profil Usaha", href: "/dashboard/settings/profile", icon: Store },
  { id: "verification", label: "Verifikasi Usaha", href: "/dashboard/settings/verification", icon: BadgeCheck },
  { id: "operations", label: "Operasional", href: "/dashboard/settings/operations", icon: SlidersHorizontal },
] as const;

const inputClass =
  "h-12 w-full rounded-lg border border-[#d8e1dc] bg-white px-4 text-sm font-semibold text-[#17251f] outline-none transition placeholder:text-[#8b9892] focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]";

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-t border-[#edf0ee] px-3 pt-2 text-[10px] font-extrabold text-[#bd3f4c] transition hover:bg-[#fff1f2] disabled:cursor-wait disabled:opacity-60 lg:mt-4 lg:justify-start lg:gap-4 lg:px-4 lg:text-xs"
    >
      <LogOut className="h-[18px] w-[18px]" />
      {pending ? "Keluar..." : "Keluar dari akun"}
    </button>
  );
}

function SettingsNavigation({ activeSection }: { activeSection: SettingsSection }) {
  return (
    <aside className="overflow-hidden rounded-[18px] border border-[#dce5e0] bg-white p-2 shadow-[0_8px_26px_rgba(16,66,45,.025)] lg:p-3">
      <nav className="grid grid-cols-3 lg:grid-cols-1" aria-label="Bagian pengaturan">
        {sections.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 text-center text-[9px] font-extrabold transition lg:flex-row lg:justify-start lg:gap-4 lg:px-4 lg:text-left lg:text-sm ${isActive ? "bg-[#edf7f0] text-[#08783f] lg:before:absolute lg:before:-left-3 lg:before:inset-y-0 lg:before:w-1 lg:before:bg-[#0a954e]" : "text-[#52645c] hover:bg-[#f7faf8] hover:text-[#08783f]"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate lg:whitespace-normal">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction}>
        <SignOutButton />
      </form>
    </aside>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-extrabold text-[#34473e]">{children}</span>;
}

function ProfileSettings({ businessName }: { businessName: string }) {
  const [name, setName] = useState(businessName);
  const [category, setCategory] = useState("Batik / Tekstil");
  const [scale, setScale] = useState("Kecil");
  const [phone, setPhone] = useState("8123456790");
  const [address, setAddress] = useState("Jl. Dr. Radjiman, Laweyan");
  const [description, setDescription] = useState("Memproduksi batik tulis dan cap untuk fashion, seragam, dan home decor.");
  const [saved, setSaved] = useState(false);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "UM";

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <h2 className="text-lg font-extrabold text-[#17251f]">Profil Usaha</h2>
      <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="mt-6 grid gap-7 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-extrabold text-[#34473e]">Logo Usaha</p>
          <button type="button" className="relative mx-auto mt-4 block h-28 w-28 rounded-full outline-none transition hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-[#dff0e5] sm:mx-0" aria-label="Ubah logo usaha">
            <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#08783f] to-[#003d2a] text-3xl font-medium text-white shadow-[0_8px_24px_rgba(8,92,53,.2)]">{initials}</span>
            <span className="absolute bottom-1 right-0 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[#55b66c] text-white"><Camera className="h-4 w-4" /></span>
          </button>
          <button type="button" className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-[#65a77f] text-xs font-extrabold text-[#08783f] transition hover:bg-[#f0f8f3]">Ubah Logo</button>
          <p className="mt-2 text-center text-[9px] font-medium text-[#718079] sm:text-left">JPG, PNG, atau WebP, maks. 750 KB</p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <FieldLabel>Nama Usaha</FieldLabel>
            <input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Kategori Usaha</FieldLabel>
              <select required value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                <option>Batik / Tekstil</option>
                <option>Kuliner</option>
                <option>Kerajinan</option>
                <option>Fashion</option>
                <option>Jasa</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Skala Usaha</FieldLabel>
              <select value={scale} onChange={(event) => setScale(event.target.value)} className={inputClass}>
                <option>Mikro</option>
                <option>Kecil</option>
                <option>Menengah</option>
              </select>
            </label>
          </div>
          <label className="block">
            <FieldLabel>Nomor WhatsApp Usaha</FieldLabel>
            <span className="flex h-12 overflow-hidden rounded-lg border border-[#d8e1dc] bg-white transition focus-within:border-[#69a982] focus-within:ring-4 focus-within:ring-[#dff0e5]">
              <span className="grid place-items-center border-r border-[#e0e6e2] bg-[#f5f8f6] px-3 text-sm font-extrabold text-[#52645c]">+62</span>
              <input required type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 13))} className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-[#17251f] outline-none" />
            </span>
          </label>
          <label className="block">
            <FieldLabel>Alamat Operasional</FieldLabel>
            <input required value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-xs font-extrabold text-[#34473e]">
              <span>Deskripsi Usaha</span>
              <span className="text-[9px] font-semibold text-[#718079]">{description.length}/320</span>
            </span>
            <textarea required value={description} onChange={(event) => setDescription(event.target.value.slice(0, 320))} rows={4} className="w-full resize-y rounded-lg border border-[#d8e1dc] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#17251f] outline-none transition focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]" />
          </label>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            {saved ? <p className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08783f]"><CheckCircle2 className="h-4 w-4" /> Perubahan tersimpan</p> : <span />}
            <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_7px_16px_rgba(8,120,63,.16)] transition hover:bg-[#066f3a]">
              <Save className="h-[15px] w-[15px]" /> Simpan Perubahan
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function VerificationRow({
  icon: Icon,
  title,
  description,
  status,
  complete,
  actionLabel,
}: {
  icon: typeof Smartphone;
  title: string;
  description: string;
  status: string;
  complete?: boolean;
  actionLabel?: string;
}) {
  const StatusIcon = complete ? CheckCircle2 : Clock3;

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1.3fr)_auto_minmax(120px,.65fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${complete ? "bg-[#e8f5eb] text-[#08783f]" : "bg-[#eef0f3] text-[#68737d]"}`}>
          <Icon className="h-[21px] w-[21px]" />
        </span>
        <span className="min-w-0">
          <strong className="block text-xs font-extrabold text-[#273830]">{title}</strong>
          <span className="mt-1 block text-[10px] font-medium text-[#718079]">{description}</span>
        </span>
      </div>
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${complete ? "bg-[#e8f5eb] text-[#08783f]" : "bg-[#eef0f3] text-[#68737d]"}`}>
        {status} <StatusIcon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[10px] font-semibold leading-5 text-[#718079]">{complete ? "Meningkatkan kepercayaan profil" : "Tidak menghalangi fitur inti"}</span>
      <span className="flex items-center justify-end gap-3">
        {actionLabel ? <button type="button" className="h-9 whitespace-nowrap rounded-lg border border-[#65a77f] px-4 text-[10px] font-extrabold text-[#08783f] hover:bg-[#f0f8f3]">{actionLabel}</button> : null}
        <ChevronRight className="h-[17px] w-[17px] text-[#697a73]" />
      </span>
    </div>
  );
}

function VerificationSettings() {
  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <div>
        <h2 className="text-lg font-extrabold text-[#17251f]">Verifikasi Usaha</h2>
        <p className="mt-1 text-xs font-medium leading-5 text-[#6b7c74]">Status verifikasi membantu pekerja dan mitra pool menilai kepercayaan usaha Anda.</p>
      </div>
      <div className="mt-6 divide-y divide-[#e3eae6] overflow-hidden rounded-xl border border-[#dce5e0]">
        <VerificationRow icon={Smartphone} title="Verifikasi WhatsApp" description="+62 812-3456-790" status="Selesai" complete />
        <VerificationRow icon={Store} title="Profil Publik Usaha" description="Nama, produk, alamat, dan kontak sudah tampil" status="Selesai" complete />
        <VerificationRow icon={IdCard} title="Nomor Induk Berusaha (NIB)" description="Dokumen legal usaha untuk badge terverifikasi" status="Belum dilakukan" actionLabel="Unggah NIB" />
        <VerificationRow icon={UploadCloud} title="Dokumen Pendukung" description="Foto toko, izin lokasi, atau bukti produksi" status="Opsional" actionLabel="Upload" />
      </div>
    </section>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#dce5e0] p-4 transition hover:bg-[#f7faf8]">
      <span className="min-w-0">
        <span className="block text-xs font-extrabold text-[#273830]">{title}</span>
        <span className="mt-1 block text-[10px] font-medium leading-5 text-[#718079]">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-[#08783f]" />
    </label>
  );
}

function OperationsSettings() {
  const [autoClose, setAutoClose] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [poolAlerts, setPoolAlerts] = useState(true);
  const [radius, setRadius] = useState("10 km");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <h2 className="text-lg font-extrabold text-[#17251f]">Operasional</h2>
      <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="mt-6 space-y-6">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold text-[#34473e]"><Bell className="h-4 w-4" /> Notifikasi</h3>
          <div className="grid gap-3">
            <ToggleRow title="Notifikasi pelamar baru" description="Kirim pengingat saat ada kandidat baru di papan loker Anda." checked={whatsappAlerts} onChange={setWhatsappAlerts} />
            <ToggleRow title="Update pool patungan" description="Beritahu saat target pool hampir terpenuhi atau batas waktu mendekat." checked={poolAlerts} onChange={setPoolAlerts} />
            <ToggleRow title="Tutup otomatis lowongan penuh" description="Lowongan akan berhenti menerima pelamar setelah kuota pekerja terpenuhi." checked={autoClose} onChange={setAutoClose} />
          </div>
        </div>

        <label className="block max-w-sm">
          <span className="mb-2 flex items-center gap-2 text-xs font-extrabold text-[#34473e]"><MapPin className="h-4 w-4" /> Radius prioritas</span>
          <select value={radius} onChange={(event) => setRadius(event.target.value)} className={inputClass}>
            <option>5 km</option>
            <option>10 km</option>
            <option>20 km</option>
            <option>Seluruh Solo Raya</option>
          </select>
        </label>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          {saved ? <p className="inline-flex items-center gap-2 text-xs font-extrabold text-[#08783f]"><CheckCircle2 className="h-4 w-4" /> Preferensi tersimpan</p> : <span />}
          <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_7px_16px_rgba(8,120,63,.16)] transition hover:bg-[#066f3a]">
            <Save className="h-[15px] w-[15px]" /> Simpan Preferensi
          </button>
        </div>
      </form>
    </section>
  );
}

function resolveSection(section: string): SettingsSection {
  if (section === "verification" || section === "operations") return section;
  return "profile";
}

export function UmkmSettingsPage({
  ownerName,
  businessName,
  profileCompletion,
  section,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
  section: string;
}) {
  const activeSection = resolveSection(section);

  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <SettingsNavigation activeSection={activeSection} />
        {activeSection === "profile" ? <ProfileSettings businessName={businessName} /> : null}
        {activeSection === "verification" ? <VerificationSettings /> : null}
        {activeSection === "operations" ? <OperationsSettings /> : null}
      </div>
    </UmkmDashboardShell>
  );
}
