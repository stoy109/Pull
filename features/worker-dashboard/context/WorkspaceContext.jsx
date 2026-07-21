import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  defaultAdvancedFilters,
  initialActivities,
  initialApplications,
  initialCertificates,
  initialExperiences,
  initialPortfolio,
  initialProfile as mockInitialProfile,
  initialSkills,
} from '../data/mockData'

const WorkspaceContext = createContext(null)

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage may be unavailable in private browsing. In-memory state still works.
    }
  }, [key, value])

  return [value, setValue]
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function WorkspaceProvider({ children, initialProfile }) {
  const navigate = useNavigate()
  const [profile, setProfile] = usePersistentState('pull-worker-profile-v2', { ...mockInitialProfile, ...initialProfile })
  const [applications, setApplications] = usePersistentState('pull-worker-applications-v2', initialApplications)
  const [activities, setActivities] = usePersistentState('pull-worker-activities-v2', initialActivities)
  const [portfolio, setPortfolio] = usePersistentState('pull-worker-portfolio-v2', initialPortfolio)
  const [certificates, setCertificates] = usePersistentState('pull-worker-certificates-v2', initialCertificates)
  const [experiences, setExperiences] = usePersistentState('pull-worker-experiences-v2', initialExperiences)
  const [skills, setSkills] = usePersistentState('pull-worker-skills-v2', initialSkills)
  const [savedJobIds, setSavedJobIds] = usePersistentState('pull-worker-saved-jobs-v2', [2])
  const [appliedJobIds, setAppliedJobIds] = usePersistentState('pull-worker-applied-jobs-v2', [])
  const [advancedFilters, setAdvancedFilters] = usePersistentState('pull-worker-filters-v2', defaultAdvancedFilters)
  const [availability, setAvailability] = usePersistentState('pull-worker-availability-v2', 'Siap menerima tawaran')
  const [dialog, setDialog] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const unreadCount = activities.filter((activity) => !activity.read).length
  const activeApplicationCount = applications.Dilamar.length + applications.Ditinjau.length + applications.Interview.length

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2800)
  }

  const addActivity = (title, detail, icon = 'bell', tone = 'brand') => {
    setActivities((current) => [{ id: `activity-${Date.now()}`, title, detail, icon, tone, time: 'Baru saja', read: false }, ...current])
  }

  const openDialog = (type, payload = {}) => setDialog({ type, ...payload })
  const closeDialog = () => setDialog(null)

  const toggleSavedJob = (jobId) => {
    setSavedJobIds((current) => current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId])
  }

  const markActivityRead = (id) => {
    setActivities((current) => current.map((activity) => activity.id === id ? { ...activity, read: true } : activity))
  }

  const markAllActivitiesRead = () => {
    setActivities((current) => current.map((activity) => ({ ...activity, read: true })))
    showToast('Semua notifikasi ditandai dibaca')
  }

  const updateApplication = (stage, id, patch) => {
    setApplications((current) => ({
      ...current,
      [stage]: current[stage].map((application) => application.id === id ? { ...application, ...patch } : application),
    }))
  }

  const findApplication = (id) => {
    for (const [stage, items] of Object.entries(applications)) {
      const application = items.find((item) => item.id === id)
      if (application) return { application, stage }
    }
    return null
  }

  const openWhatsApp = (message) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const handleModalEvent = (type, payload = {}) => {
    if (type === 'confirm-interview' || type === 'reschedule-interview') {
      const confirmed = type === 'confirm-interview'
      updateApplication('Interview', payload.id, {
        time: payload.schedule,
        status: confirmed ? 'Kehadiran dikonfirmasi' : 'Permintaan jadwal dikirim',
        urgent: false,
      })
      addActivity(confirmed ? 'Interview dikonfirmasi' : 'Jadwal baru diminta', `${payload.schedule} · Warung Mapan`, 'calendar', confirmed ? 'brand' : 'warm')
      closeDialog()
      showToast(confirmed ? 'Kehadiran interview dikonfirmasi' : 'Permintaan jadwal dikirim')
      return
    }

    if (type === 'submit-kyc') {
      setProfile((current) => ({ ...current, ktpStatus: 'pending' }))
      addActivity('KTP dikirim untuk verifikasi', `File ${payload.fileName} masuk pemeriksaan privat admin.`, 'identity', 'brand')
      closeDialog()
      showToast('KTP dikirim. Estimasi pemeriksaan 1×24 jam')
      return
    }

    if (type === 'add-certificate') {
      const certificate = { id: `certificate-${Date.now()}`, ...payload, status: 'Menunggu verifikasi' }
      setCertificates((current) => [certificate, ...current])
      setProfile((current) => ({ ...current, completion: Math.min(100, current.completion + 3) }))
      addActivity('Sertifikat menunggu verifikasi', `${payload.name} sudah tersimpan dan dikirim ke admin.`, 'award', 'warm')
      closeDialog()
      showToast('Sertifikat berhasil diunggah')
      return
    }

    if (type === 'update-profile') {
      setProfile((current) => ({ ...current, ...payload, completion: Math.max(current.completion, 92) }))
      addActivity('Profil diperbarui', 'Preferensi dan informasi profesional berhasil disimpan.', 'user', 'brand')
      closeDialog()
      showToast('Profil berhasil diperbarui')
      return
    }

    if (type === 'add-portfolio') {
      setPortfolio((current) => [{ id: `portfolio-${Date.now()}`, ...payload }, ...current])
      setProfile((current) => ({ ...current, completion: Math.min(100, current.completion + 4) }))
      addActivity('Portofolio baru ditambahkan', `${payload.title} kini tampil di profil publik.`, 'camera', 'brand')
      closeDialog()
      showToast('Portofolio berhasil ditambahkan')
      return
    }

    if (type === 'add-experience') {
      setExperiences((current) => [{ id: `experience-${Date.now()}`, ...payload }, ...current])
      setProfile((current) => ({ ...current, completion: Math.min(100, current.completion + 4) }))
      addActivity('Pengalaman kerja ditambahkan', `${payload.role} di ${payload.company} kini tampil di profil.`, 'briefcase', 'brand')
      closeDialog()
      showToast('Pengalaman kerja berhasil ditambahkan')
      return
    }

    if (type === 'contact-job') {
      const { job, message } = payload
      setAppliedJobIds((current) => current.includes(job.id) ? current : [...current, job.id])
      setApplications((current) => current.Dilamar.some((application) => application.jobId === job.id) ? current : ({
        ...current,
        Dilamar: [{
          id: `job-application-${job.id}`,
          jobId: job.id,
          company: job.company,
          role: job.role,
          time: 'Dilamar baru saja',
          status: 'Percakapan WhatsApp dibuka',
          location: job.district,
          pay: job.pay,
        }, ...current.Dilamar],
      }))
      addActivity('Lamaran baru dicatat', `${job.role} di ${job.company} dibuka melalui redirect WhatsApp privat.`, 'briefcase', 'brand')
      closeDialog()
      openWhatsApp(message)
      showToast('Lamaran dicatat. Membuka WhatsApp')
      return
    }

    if (type === 'contact-employer') {
      const application = payload.application
      openWhatsApp(`Halo ${application.company}, saya Dimas ingin menindaklanjuti lamaran posisi ${application.role} melalui Pull.`)
      showToast('Membuka WhatsApp melalui kontak privat')
      return
    }

    if (type === 'confirm-work') {
      updateApplication('Selesai', payload.id, { workerConfirmed: true, status: 'Rating sudah terbuka' })
      addActivity('Pekerjaan selesai dikonfirmasi', 'Kedua pihak sudah mengonfirmasi. Rating dua arah kini terbuka.', 'check', 'brand')
      showToast('Konfirmasi tersimpan. Rating sekarang terbuka')
      return
    }

    if (type === 'submit-rating') {
      updateApplication('Selesai', payload.id, { rated: true, rating: payload.rating, review: payload.review, status: 'Rating terkirim' })
      addActivity('Rating pekerjaan terkirim', `${payload.rating}/5 untuk Sambal Mbokde. Ulasan terikat pada pekerjaan terverifikasi.`, 'star', 'warm')
      closeDialog()
      showToast('Rating berhasil dikirim')
      return
    }

    if (type === 'withdraw-application') {
      setApplications((current) => ({ ...current, [payload.stage]: current[payload.stage].filter((application) => application.id !== payload.id) }))
      closeDialog()
      navigate('/applications')
      showToast('Lamaran berhasil ditarik')
      return
    }



    if (type === 'save-filters') {
      setAdvancedFilters(payload)
      closeDialog()
      showToast('Filter loker diterapkan')
      return
    }

    if (type === 'add-skill') {
      if (!payload.name || skills.some((skill) => skill.name.toLowerCase() === payload.name.toLowerCase())) {
        showToast('Skill sudah ada')
        return
      }
      setSkills((current) => [...current, { name: payload.name, verified: false }])
      showToast(`${payload.name} ditambahkan`)
      return
    }

    if (type === 'remove-skill') {
      setSkills((current) => current.filter((skill) => skill.name !== payload.name))
      showToast(`${payload.name} dihapus`)
      return
    }

    if (type === 'complete-learning') {
      setSkills((current) => current.some((skill) => skill.name === 'Kasir digital')
        ? current.map((skill) => skill.name === 'Kasir digital' ? { ...skill, verified: true } : skill)
        : [...current, { name: 'Kasir digital', verified: true }])
      addActivity('Modul Kasir digital selesai', 'Skill baru ditambahkan dan ditandai sebagai hasil belajar Pull.', 'graduation', 'brand')
      closeDialog()
      showToast('Modul selesai. Skill Kasir digital ditambahkan')
      return
    }

    if (type === 'save-settings') {
      setProfile((current) => ({ ...current, ...payload }))
      closeDialog()
      if (payload.pushEnabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => showToast(permission === 'granted' ? 'Pengaturan disimpan. Push notification aktif' : 'Pengaturan disimpan. Izin push belum diberikan'))
      } else {
        showToast('Pengaturan matching disimpan')
      }
      return
    }

    if (type === 'set-availability') {
      setAvailability(payload.availability)
      closeDialog()
      showToast(`Status diubah: ${payload.availability}`)
      return
    }

    if (type === 'share-profile') {
      const url = `${window.location.origin}/worker/profile`
      if (navigator.share) navigator.share({ title: `Profil Pull ${profile.name}`, url }).catch(() => {})
      else navigator.clipboard?.writeText(url)
      showToast('Tautan profil siap dibagikan')
      return
    }

    if (type === 'download-cv') {
      const certificateList = certificates.map((item) => `<li><strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.issuer)}</li>`).join('')
      const portfolioList = portfolio.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.client)}</li>`).join('')
      const experienceList = experiences.map((item) => `<li><strong>${escapeHtml(item.role)}</strong> — ${escapeHtml(item.company)}<br>${escapeHtml(item.start)} sampai ${escapeHtml(item.end)}<br>${escapeHtml(item.description)}</li>`).join('')
      const html = `<!doctype html><html lang="id"><meta charset="utf-8"><title>CV ${escapeHtml(profile.name)}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;color:#17392c;line-height:1.6}h1{margin:0;font-size:32px}h2{margin-top:28px;border-bottom:1px solid #dfeae2;padding-bottom:6px;font-size:16px}p,li{font-size:13px}.meta{color:#507f63}</style><h1>${escapeHtml(profile.name)}</h1><p class="meta">${escapeHtml(profile.title)} · ${escapeHtml(profile.district)}, Surakarta · WhatsApp terverifikasi</p><h2>Ringkasan</h2><p>${escapeHtml(profile.bio)}</p><h2>Pengalaman</h2><ul>${experienceList}</ul><h2>Skill</h2><p>${skills.map((skill) => escapeHtml(skill.name)).join(' · ')}</p><h2>Sertifikat</h2><ul>${certificateList}</ul><h2>Portofolio</h2><ul>${portfolioList}</ul><p class="meta">Dibuat dari profil Pull pada 18 Juli 2026</p></html>`
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'CV-Dimas-Pratama-Pull.html'
      link.click()
      URL.revokeObjectURL(url)
      closeDialog()
      showToast('CV berhasil diunduh')
      return
    }

    if (type === 'contact-support') {
      window.location.href = 'mailto:dukungan@pull.id?subject=Bantuan%20akun%20pekerja'
      return
    }

  }

  const resetDemo = () => {
    Object.keys(window.localStorage).filter((key) => key.startsWith('pull-worker-')).forEach((key) => window.localStorage.removeItem(key))
    window.location.reload()
  }

  const value = {
    profile,
    applications,
    activities,
    portfolio,
    certificates,
    experiences,
    skills,
    savedJobIds,
    appliedJobIds,
    advancedFilters,
    availability,
    dialog,
    toast,
    unreadCount,
    activeApplicationCount,
    openDialog,
    closeDialog,
    showToast,
    addActivity,
    toggleSavedJob,
    markActivityRead,
    markAllActivitiesRead,
    updateApplication,
    findApplication,
    openWhatsApp,
    handleModalEvent,
    resetDemo,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return context
}
