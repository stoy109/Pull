import { Bell, IdCard, MapPin, RefreshCcw, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageHeader, SectionHeading } from '../components/UI'
import AvailabilityDropdown from '../components/AvailabilityDropdown'

export default function SettingsPage() {
  const { profile, availability, openDialog, handleModalEvent, resetDemo } = useWorkspace()
  const reset = () => {
    const confirmed = window.confirm('Reset seluruh data demo Pull ke kondisi awal? Perubahan profil, lamaran, dan bukti kerja akan dihapus dari perangkat ini.')
    if (confirmed) resetDemo()
  }
  return (
    <>
      <PageHeader eyebrow="Akun pekerja" title="Pengaturan" description="Kelola preferensi matching, notifikasi, ketersediaan, dan privasi akun." />
      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <section className="card col-span-12 xl:col-span-7"><SectionHeading eyebrow="Matching" title="Preferensi pekerjaan" description="Data ini dipakai untuk mengurutkan rekomendasi loker." /><div className="grid gap-2 sm:grid-cols-2"><SettingValue icon={MapPin} label="Lokasi & radius" value={`${profile.district} · ${profile.radius}`} /><SettingValue icon={UserRound} label="Tipe kerja" value={profile.workPreference} /><SettingValue icon={ShieldCheck} label="Upah minimum" value={profile.minimumPay} /><SettingValue icon={Bell} label="Push matching" value={profile.pushEnabled ? 'Aktif' : 'Nonaktif'} /></div><button onClick={() => openDialog('settings')} className="primary-button mt-4">Edit preferensi</button></section>
        <AvailabilityDropdown value={availability} onChange={(nextValue) => handleModalEvent('set-availability', { availability: nextValue })} />
        <section className="card col-span-12 xl:col-span-6"><SectionHeading eyebrow="Identitas" title="Keamanan & verifikasi" /><div className="space-y-2"><SettingRow icon={Smartphone} title="WhatsApp terverifikasi" detail="+62•••4821 · Level 1 wajib untuk login" status="Aktif" /><button onClick={() => openDialog('kyc')} className="w-full"><SettingRow icon={IdCard} title="Verifikasi KTP" detail="Opsional untuk badge Verified Member" status={profile.ktpStatus === 'pending' ? 'Diperiksa' : profile.ktpStatus === 'verified' ? 'Selesai' : 'Mulai'} /></button></div><div className="info-note mt-4"><ShieldCheck size={16} /><p>Nomor WhatsApp dan dokumen identitas tidak pernah ditampilkan mentah di halaman publik.</p></div></section>
        <section className="card col-span-12 xl:col-span-6"><SectionHeading eyebrow="Perangkat" title="Aplikasi & notifikasi" /><div className="space-y-2"><SettingRow icon={Bell} title="Push notification" detail="Lowongan cocok dan perubahan lamaran" status={profile.pushEnabled ? 'Aktif' : 'Nonaktif'} /><SettingRow icon={Smartphone} title="PWA Pull" detail="Dapat dipasang dari menu browser" status="Siap" /></div><button onClick={() => openDialog('settings')} className="secondary-button mt-4">Atur notifikasi</button></section>
        <section className="card col-span-12 border-[#ecd9d0]"><SectionHeading eyebrow="Data demo" title="Reset ruang kerja" description="Menghapus perubahan dummy dari localStorage dan mengembalikan akun Dimas ke kondisi awal." /><button onClick={reset} className="secondary-button border-[#e4c8bd] text-[#9a4d38]"><RefreshCcw size={14} /> Reset semua data demo</button></section>
      </div>
    </>
  )
}

function SettingValue({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-pull-100 p-3"><Icon size={15} className="text-pull-500" /><p className="mt-2 text-[9px] font-bold text-pull-400">{label}</p><p className="mt-1 text-[10px] font-extrabold text-pull-800">{value}</p></div>
}

function SettingRow({ icon: Icon, title, detail, status }) {
  return <div className="flex items-center gap-3 rounded-xl border border-pull-100 p-3 text-left"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pull-50 text-pull-600"><Icon size={16} /></span><span className="flex-1"><span className="block text-[10px] font-extrabold text-pull-800">{title}</span><span className="mt-0.5 block text-[9px] text-pull-400">{detail}</span></span><span className="text-[9px] font-extrabold text-pull-600">{status}</span></div>
}
