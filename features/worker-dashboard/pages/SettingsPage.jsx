import { useState } from 'react'
import { Navigate, NavLink, useLocation } from 'react-router-dom'
import {
  BadgeCheck,
  Camera,
  ChevronDown,
  CircleCheck,
  Clock3,
  IdCard,
  LogOut,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { PostalLocationFields } from '../../../components/postal-location-fields'
import { SkillPicker } from '../../../components/skill-picker'
import { WORKER_JOB_FIELDS } from '../../../lib/worker-profile-options'
import AvailabilityDropdown from '../components/AvailabilityDropdown'
import { useWorkspace } from '../context/WorkspaceContext'

const sections = [
  { id: 'profile', label: 'Profil', path: '/settings/profile', icon: UserRound },
  { id: 'verification', label: 'Verifikasi Akun', path: '/settings/verification', icon: BadgeCheck },
  { id: 'work', label: 'Preferensi Kerja', path: '/settings/work', icon: SlidersHorizontal },
]

export default function SettingsPage() {
  const location = useLocation()
  const section = location.pathname.split('/').filter(Boolean).at(-1)

  if (section === 'settings') return <Navigate to="/settings/profile" replace />
  if (!sections.some((item) => item.id === section)) return <Navigate to="/settings/profile" replace />

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      <SettingsNavigation />
      {section === 'profile' ? <ProfileSettings /> : null}
      {section === 'verification' ? <VerificationSettings /> : null}
      {section === 'work' ? <WorkPreferences /> : null}
    </div>
  )
}

function SettingsNavigation() {
  const { openDialog, resetDemo } = useWorkspace()
  return (
    <aside className="overflow-hidden rounded-[18px] border border-[#dce5e0] bg-white p-2 shadow-[0_8px_26px_rgba(16,66,45,.025)] lg:p-3">
      <nav className="grid grid-cols-3 lg:grid-cols-1" aria-label="Bagian pengaturan">
        {sections.map((item) => {
          const Icon = item.icon
          return <NavLink key={item.id} to={item.path} className={({ isActive }) => `relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 text-center text-[9px] font-extrabold transition lg:flex-row lg:justify-start lg:gap-4 lg:px-4 lg:text-left lg:text-sm ${isActive ? 'bg-[#edf7f0] text-[#08783f] lg:before:absolute lg:before:-left-3 lg:before:inset-y-0 lg:before:w-1 lg:before:bg-[#0a954e]' : 'text-[#52645c] hover:bg-[#f7faf8] hover:text-[#08783f]'}`}><Icon size={20} className="shrink-0" /><span className="truncate lg:whitespace-normal">{item.label}</span></NavLink>
        })}
      </nav>
      <button type="button" onClick={() => openDialog('logout')} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-t border-[#edf0ee] px-3 pt-2 text-[10px] font-extrabold text-[#bd3f4c] transition hover:bg-[#fff1f2] lg:mt-4 lg:justify-start lg:gap-4 lg:px-4 lg:text-xs"><LogOut size={18} /> Keluar dari akun</button>
      <button type="button" onClick={() => window.confirm('Reset semua perubahan dan kembalikan data dummy ke kondisi awal?') && resetDemo()} className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-[10px] font-extrabold text-[#697a73] transition hover:bg-[#f3f6f4] hover:text-[#34473e] lg:justify-start lg:gap-4 lg:px-4 lg:text-xs"><RotateCcw size={18} /> Reset data dummy</button>
    </aside>
  )
}

function ProfileSettings() {
  const { profile, skills, handleModalEvent, openDialog, showToast } = useWorkspace()
  const [name, setName] = useState(profile.name)
  const [jobField, setJobField] = useState(profile.title)
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel)
  const [bio, setBio] = useState(profile.bio)
  const [phone, setPhone] = useState(() => String(profile.phone || '').replace(/^\+?62/, '').replace(/\D/g, ''))
  const [photo, setPhoto] = useState(profile.photo || '')
  const [location, setLocation] = useState({
    postalCode: profile.postalCode || '',
    province: profile.province || '',
    city: profile.city || '',
    district: profile.district || '',
    village: profile.village || '',
  })
  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()
  const skillNames = skills.map((skill) => skill.name)
  const phoneValue = phone ? `+62${phone.replace(/^0+/, '')}` : ''
  const jobFieldOptions = WORKER_JOB_FIELDS.includes(jobField) || !jobField ? WORKER_JOB_FIELDS : [jobField, ...WORKER_JOB_FIELDS]

  const updatePhoto = (file) => {
    if (!file) return
    if (file.size > 750_000) {
      showToast('Ukuran foto maksimal 750 KB')
      return
    }
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setPhoto(String(reader.result))
      showToast('Foto siap disimpan')
    }, { once: true })
    reader.readAsDataURL(file)
  }

  const saveProfile = (event) => {
    event.preventDefault()
    if (phone.replace(/^0+/, '').length < 9) {
      showToast('Masukkan nomor WhatsApp yang valid')
      return
    }
    if (!location.province || !location.city || !location.district || !location.village) {
      showToast('Lengkapi lokasi berdasarkan kode pos')
      return
    }
    const phoneChanged = phoneValue !== profile.phone
    handleModalEvent('update-profile', {
      name: name.trim(),
      title: jobField,
      experienceLevel,
      bio: bio.trim(),
      photo,
      phone: phoneValue,
      whatsappVerified: phoneChanged ? false : profile.whatsappVerified,
      postalCode: location.postalCode,
      province: location.province,
      city: location.city,
      district: location.district,
      village: location.village,
    })
    if (phoneChanged) openDialog('phone-verification')
  }

  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <h2 className="text-lg font-extrabold text-[#17251f]">Profil</h2>
      <form onSubmit={saveProfile} className="mt-6 grid gap-7 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-extrabold text-[#34473e]">Foto Profil</p>
          <input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => updatePhoto(event.target.files?.[0])} />
          <label htmlFor="profile-photo" className="relative mx-auto mt-4 block size-28 cursor-pointer rounded-full outline-none transition hover:scale-[1.03] focus-within:ring-4 focus-within:ring-[#dff0e5] sm:mx-0" aria-label="Ubah foto profil">
            <span className="grid size-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#08783f] to-[#003d2a] bg-cover bg-center text-3xl font-medium text-white shadow-[0_8px_24px_rgba(8,92,53,.2)]" style={photo ? { backgroundImage: `url(${photo})` } : undefined}>{photo ? null : initials}</span>
            <span className="absolute bottom-1 right-0 grid size-9 place-items-center rounded-full border-4 border-white bg-[#55b66c] text-white"><Camera size={16} /></span>
          </label>
          <label htmlFor="profile-photo" className="mt-5 flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[#65a77f] text-xs font-extrabold text-[#08783f] transition hover:bg-[#f0f8f3]">Ubah Foto</label>
          <p className="mt-2 text-center text-[9px] font-medium text-[#718079] sm:text-left">JPG, PNG, atau WebP · maks. 750 KB</p>
        </div>

        <div className="space-y-5">
          <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">Nama Lengkap</span><input required value={name} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-lg border border-[#d8e1dc] bg-white px-4 text-sm font-semibold text-[#17251f] outline-none transition focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]" /></label>
          <label className="block"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-extrabold text-[#34473e]"><span>Nomor WhatsApp</span><span className={`text-[9px] ${profile.whatsappVerified ? 'text-[#08783f]' : 'text-[#c06d26]'}`}>{profile.whatsappVerified ? 'Terverifikasi' : 'Perlu verifikasi'}</span></span><span className="flex h-12 overflow-hidden rounded-lg border border-[#d8e1dc] bg-white transition focus-within:border-[#69a982] focus-within:ring-4 focus-within:ring-[#dff0e5]"><span className="grid place-items-center border-r border-[#e0e6e2] bg-[#f5f8f6] px-3 text-sm font-extrabold text-[#52645c]">+62</span><input required type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 13))} placeholder="81234567890" className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-[#17251f] outline-none placeholder:text-[#8b9892]" /></span><span className="mt-1.5 block text-[10px] font-medium text-[#718079]">Nomor baru harus diverifikasi ulang dengan OTP.</span></label>
          <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">Bidang Pekerjaan Utama</span><span className="relative block"><select required value={jobField} onChange={(event) => setJobField(event.target.value)} className="h-12 w-full appearance-none rounded-lg border border-[#d8e1dc] bg-white px-4 pr-11 text-sm font-semibold text-[#17251f] outline-none transition focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]"><option value="">Pilih bidang pekerjaan</option>{jobFieldOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7068]" /></span></label>
          <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">Pengalaman Kerja</span><span className="relative block"><select required value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} className="h-12 w-full appearance-none rounded-lg border border-[#d8e1dc] bg-white px-4 pr-11 text-sm font-semibold text-[#17251f] outline-none transition focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]"><option>Belum ada pengalaman</option><option>Kurang dari 1 tahun</option><option>1–3 tahun</option><option>Lebih dari 3 tahun</option></select><ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7068]" /></span></label>
          <label className="block"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-extrabold text-[#34473e]"><span>Tentang Saya</span><span className="text-[9px] font-semibold text-[#718079]">{bio.length}/320</span></span><textarea required value={bio} onChange={(event) => setBio(event.target.value.slice(0, 320))} rows={4} placeholder="Ceritakan pengalaman, kekuatan, dan cara kerja Anda" className="w-full resize-y rounded-lg border border-[#d8e1dc] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#17251f] outline-none transition placeholder:text-[#8b9892] focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]" /></label>
          <div><h3 className="text-sm font-extrabold text-[#17251f]">Lokasi</h3><p className="mt-1 text-[10px] font-medium leading-5 text-[#718079]">Masukkan kode pos, lalu pilih kecamatan dan kelurahan yang sesuai.</p><div className="mt-4"><PostalLocationFields value={location} onChangeAction={setLocation} /></div></div>
          <button type="submit" className="ml-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_7px_16px_rgba(8,120,63,.16)] transition hover:bg-[#066f3a]"><Save size={15} /> Simpan Perubahan</button>
        </div>
      </form>
      <div className="mt-7 border-t border-[#e1e8e4] pt-7">
        <h3 className="text-base font-extrabold text-[#17251f]">Keahlian</h3>
        <p className="mt-1 text-xs font-medium leading-5 text-[#6b7c74]">Tambahkan keahlian spesifik agar lowongan dan employer yang tepat lebih mudah menemukan Anda.</p>
        <div className="mt-5"><SkillPicker value={skillNames} onChangeAction={(nextSkills) => handleModalEvent('set-skills', { skills: nextSkills })} /></div>
      </div>
    </section>
  )
}


const workTypeOptions = [
  { id: 'daily', label: 'Harian', unit: '/hari', field: 'minimumPayDaily' },
  { id: 'monthly', label: 'Bulanan', unit: '/bulan', field: 'minimumPayMonthly' },
  { id: 'project', label: 'Per proyek', unit: '/proyek', field: 'minimumPayProject' },
]

function formatPayInput(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 12)
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}

function initialWorkTypes(profile) {
  if (Array.isArray(profile.workTypes)) return Object.fromEntries(workTypeOptions.map((item) => [item.id, profile.workTypes.includes(item.id)]))
  const preference = String(profile.workPreference || '').toLowerCase()
  return {
    daily: preference.includes('harian') || preference.includes('semua'),
    monthly: preference.includes('bulanan') || preference.includes('semua'),
    project: preference.includes('proyek') || preference.includes('borongan') || preference.includes('semua'),
  }
}

function WorkPreferences() {
  const { profile, availability, handleModalEvent, showToast } = useWorkspace()
  const [workTypes, setWorkTypes] = useState(() => initialWorkTypes(profile))
  const [minimumPays, setMinimumPays] = useState(() => ({
    daily: formatPayInput(profile.minimumPayDaily || (initialWorkTypes(profile).daily ? profile.minimumPay : '')),
    monthly: formatPayInput(profile.minimumPayMonthly),
    project: formatPayInput(profile.minimumPayProject),
  }))
  const [radius, setRadius] = useState(profile.radius)

  const savePreferences = (event) => {
    event.preventDefault()
    const selectedTypes = workTypeOptions.filter((item) => workTypes[item.id])
    if (!selectedTypes.length) {
      showToast('Pilih minimal satu tipe pekerjaan')
      return
    }
    const payValues = Object.fromEntries(workTypeOptions.map((item) => [item.field, workTypes[item.id] ? (minimumPays[item.id] ? `Rp${minimumPays[item.id]} ${item.unit}` : `Tergantung UMKM ${item.unit}`) : '']))
    handleModalEvent('update-profile', {
      workTypes: selectedTypes.map((item) => item.id),
      workPreference: selectedTypes.map((item) => item.label).join(', '),
      minimumPay: payValues[selectedTypes[0].field],
      ...payValues,
      radius,
    })
  }

  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <h2 className="text-lg font-extrabold text-[#17251f]">Preferensi Kerja</h2>
      <p className="mt-1 text-xs font-medium leading-5 text-[#6b7c74]">Pilih tipe pekerjaan dan isi upah minimum jika diperlukan. Nominal kosong berarti mengikuti penawaran UMKM.</p>

      <form onSubmit={savePreferences} className="mt-6 space-y-6">
        <div><h3 className="mb-2 text-xs font-extrabold text-[#34473e]">Status Ketersediaan</h3><AvailabilityDropdown value={availability} onChange={(nextValue) => handleModalEvent('set-availability', { availability: nextValue })} /></div>

        <div><h3 className="text-xs font-extrabold text-[#34473e]">Tipe Pekerjaan & Upah Minimum</h3><p className="mt-1 text-[10px] font-medium leading-5 text-[#718079]">Input aktif untuk tipe yang dicentang. Kosongkan nominal jika upah mengikuti UMKM.</p><div className="mt-3 space-y-3">{workTypeOptions.map((item) => <PayPreferenceRow key={item.id} {...item} checked={workTypes[item.id]} value={minimumPays[item.id]} onToggle={(checked) => setWorkTypes((current) => ({ ...current, [item.id]: checked }))} onChange={(value) => setMinimumPays((current) => ({ ...current, [item.id]: formatPayInput(value) }))} />)}</div></div>

        <label className="block max-w-sm"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">Radius Pencarian</span><span className="relative block"><select value={radius} onChange={(event) => setRadius(event.target.value)} className="h-12 w-full appearance-none rounded-lg border border-[#d8e1dc] bg-white px-4 pr-11 text-sm font-semibold text-[#17251f] outline-none transition focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]"><option>5 km</option><option>10 km</option><option>20 km</option><option>Seluruh Solo Raya</option></select><ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7068]" /></span></label>
        <button type="submit" className="ml-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_7px_16px_rgba(8,120,63,.16)] transition hover:bg-[#066f3a]"><Save size={15} /> Simpan Preferensi</button>
      </form>
    </section>
  )
}

function PayPreferenceRow({ label, unit, checked, value, onToggle, onChange }) {
  const helper = !checked ? 'Aktifkan tipe pekerjaan untuk mengisi upah' : value ? 'Upah minimum pilihan Anda' : 'Tergantung pemberi kerja (UMKM)'

  return (
    <div className={`grid gap-3 rounded-xl border p-3 transition sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center ${checked ? 'border-[#9fcbb0] bg-[#f5fbf7]' : 'border-[#e0e6e2] bg-[#f7f9f8]'}`}>
      <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={checked} onChange={(event) => onToggle(event.target.checked)} className="size-5 accent-[#08783f]" /><span className={`text-sm font-extrabold ${checked ? 'text-[#08783f]' : 'text-[#718079]'}`}>{label}</span></label>
      <div>
        <label className={`flex h-11 overflow-hidden rounded-lg border bg-white transition ${checked ? 'border-[#b8d6c3] focus-within:border-[#69a982] focus-within:ring-4 focus-within:ring-[#dff0e5]' : 'border-[#e0e5e2] opacity-60'}`}><span className="grid place-items-center border-r border-[#e0e6e2] bg-[#f4f7f5] px-3 text-xs font-extrabold text-[#52645c]">Rp</span><input disabled={!checked} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Opsional" aria-label={`Upah minimum ${label.toLowerCase()}`} className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-semibold text-[#17251f] outline-none disabled:cursor-not-allowed" /><span className="grid place-items-center border-l border-[#e0e6e2] bg-[#f4f7f5] px-3 text-xs font-extrabold text-[#52645c]">{unit}</span></label>
        <p className={`mt-1.5 text-[9px] font-semibold ${checked && !value ? 'text-[#9b671f]' : 'text-[#718079]'}`}>{helper}</p>
      </div>
    </div>
  )
}

function VerificationSettings() {
  const { profile, openDialog } = useWorkspace()
  const whatsappStatus = profile.whatsappVerified ? 'Selesai' : 'Perlu Verifikasi'
  const identityStatus = profile.ktpStatus === 'verified' ? 'Selesai' : profile.ktpStatus === 'pending' ? 'Sedang diperiksa' : 'Belum Dilakukan'
  const IdentityStatusIcon = profile.ktpStatus === 'verified' ? CircleCheck : Clock3

  return (
    <section className="rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <div><h2 className="text-lg font-extrabold text-[#17251f]">Verifikasi Akun</h2><p className="mt-1 text-xs font-medium leading-5 text-[#6b7c74]">Kelola status verifikasi untuk meningkatkan kepercayaan employer.</p></div>
      <div className="mt-6 divide-y divide-[#e3eae6] overflow-hidden rounded-xl border border-[#dce5e0]">
        <VerificationRow icon={Smartphone} title="Verifikasi WhatsApp (OTP)" description={profile.phone || 'Nomor WhatsApp belum tersedia'} status={whatsappStatus} statusIcon={profile.whatsappVerified ? CircleCheck : Clock3} action={profile.whatsappVerified ? null : <button type="button" onClick={() => openDialog('phone-verification')} className="h-9 whitespace-nowrap rounded-lg border border-[#65a77f] px-4 text-[10px] font-extrabold text-[#08783f] hover:bg-[#f0f8f3]">Verifikasi Sekarang</button>} />
        <VerificationRow icon={IdCard} title="Verifikasi Identitas (KTP)" description="Tingkatkan kepercayaan profil Anda." status={identityStatus} statusIcon={IdentityStatusIcon} optional action={profile.ktpStatus === 'verified' ? null : <button type="button" onClick={() => openDialog('kyc')} className="h-9 whitespace-nowrap rounded-lg border border-[#65a77f] px-4 text-[10px] font-extrabold text-[#08783f] hover:bg-[#f0f8f3]">{profile.ktpStatus === 'pending' ? 'Lihat Status' : 'Verifikasi Sekarang'}</button>} />
      </div>
    </section>
  )
}

function VerificationRow({ icon: Icon, title, description, status, statusIcon: StatusIcon, optional = false, action }) {
  const complete = status === 'Selesai'
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(120px,.65fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3"><span className={`grid size-11 shrink-0 place-items-center rounded-full ${complete ? 'bg-[#e8f5eb] text-[#08783f]' : 'bg-[#eef0f3] text-[#68737d]'}`}><Icon size={21} /></span><span className="min-w-0"><strong className="block text-xs font-extrabold text-[#273830]">{title}</strong><span className="mt-1 block text-[10px] font-medium text-[#718079]">{description}</span></span></div>
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${complete ? 'bg-[#e8f5eb] text-[#08783f]' : 'bg-[#eef0f3] text-[#68737d]'}`}>{status} <StatusIcon size={14} /></span>
      <span className="text-[10px] font-semibold leading-5 text-[#718079]">{optional ? 'Opsional — tidak menghalangi fitur inti' : ''}</span>
      <span className="flex items-center justify-end gap-3">{action}<ChevronDown size={17} className="text-[#697a73]" /></span>
    </div>
  )
}
