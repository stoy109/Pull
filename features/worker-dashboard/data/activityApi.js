const APPLICATION_STORAGE_PREFIX = 'pull-worker-applications-v4-'

export async function syncWorkerApplications() {
  const storageKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(APPLICATION_STORAGE_PREFIX))

  for (const storageKey of storageKeys) {
    const markerKey = `${storageKey}:activity-synced-v1`
    const synced = new Set(JSON.parse(window.localStorage.getItem(markerKey) || '[]'))
    const stages = JSON.parse(window.localStorage.getItem(storageKey) || '{}')
    const applications = Object.values(stages)
      .flatMap((items) => Array.isArray(items) ? items : [])
      .filter((application) => typeof application?.id === 'string' && application.id.startsWith('job-application-') && !synced.has(application.id))

    for (const application of applications) {
      const response = await fetch('/api/worker/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          jobReference: String(application.jobId ?? ''),
          jobTitle: String(application.role ?? 'Lowongan Pull'),
          employerName: String(application.company ?? 'UMKM Pull'),
        }),
      })

      if (!response.ok) throw new Error('Gagal mencatat lamaran.')
      synced.add(application.id)
    }

    window.localStorage.setItem(markerKey, JSON.stringify([...synced]))
  }
}

export async function fetchWorkerActivities() {
  const response = await fetch('/api/worker/activities', { cache: 'no-store' })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'Gagal memuat aktivitas.')
  }

  if (!Array.isArray(payload)) {
    throw new Error('Format data aktivitas tidak valid.')
  }

  return payload
}
