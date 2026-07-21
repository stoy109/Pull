'use client'

import { lazy, Suspense, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { EmptyState } from './components/UI'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const JobsPage = lazy(() => import('./pages/JobsPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'))
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'))
const TrustPage = lazy(() => import('./pages/TrustPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const ActivityPage = lazy(() => import('./pages/ActivityPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

function AnimatedPage({ children }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        Array.from(root.children),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.055, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
      )
    })

    return () => media.revert()
  }, [])

  return <div ref={rootRef} className="worker-page">{children}</div>
}

function PageSuspense({ children }) {
  const location = useLocation()
  return <Suspense fallback={<div className="space-y-4"><div className="h-20 animate-pulse rounded-[22px] bg-pull-100/60" /><div className="h-64 animate-pulse rounded-[22px] bg-pull-100/60" /></div>}><AnimatedPage key={location.pathname}>{children}</AnimatedPage></Suspense>
}

function AppRoutes({ initialProfile }) {
  return (
    <WorkspaceProvider initialProfile={initialProfile}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<PageSuspense><DashboardPage /></PageSuspense>} />
          <Route path="jobs" element={<PageSuspense><JobsPage /></PageSuspense>} />
          <Route path="jobs/:id" element={<PageSuspense><JobDetailPage /></PageSuspense>} />
          <Route path="applications" element={<PageSuspense><ApplicationsPage /></PageSuspense>} />
          <Route path="applications/:id" element={<PageSuspense><ApplicationDetailPage /></PageSuspense>} />
          <Route path="profile" element={<PageSuspense><ProfilePage /></PageSuspense>} />
          <Route path="certificates" element={<PageSuspense><CertificatesPage /></PageSuspense>} />
          <Route path="trust" element={<PageSuspense><TrustPage /></PageSuspense>} />
          <Route path="skills" element={<PageSuspense><SkillsPage /></PageSuspense>} />
          <Route path="activity" element={<PageSuspense><ActivityPage /></PageSuspense>} />
          <Route path="notifications" element={<PageSuspense><NotificationsPage /></PageSuspense>} />
          <Route path="settings" element={<PageSuspense><SettingsPage /></PageSuspense>} />
          <Route path="*" element={<EmptyState title="Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia di ruang kerja pekerja." />} />
        </Route>
      </Routes>
    </WorkspaceProvider>
  )
}

export default function App({ initialProfile }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) return null

  return <BrowserRouter basename="/worker"><AppRoutes initialProfile={initialProfile} /></BrowserRouter>
}
