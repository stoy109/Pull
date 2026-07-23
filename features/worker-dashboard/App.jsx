'use client'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WorkerPageContent } from '../worker-core/worker-pages'
import AppShell from './components/AppShell'

function WorkerRoute({ page, workspace, filters, notice }) {
  return <WorkerPageContent page={page} data={workspace} filters={filters} notice={notice} />
}

function AppRoutes({ workspace, filters, notice }) {
  const page = (name) => <WorkerRoute page={name} workspace={workspace} filters={filters} notice={notice} />

  return (
    <Routes>
      <Route element={<AppShell workspace={workspace} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={page('dashboard')} />
        <Route path="jobs" element={page('jobs')} />
        <Route path="jobs/:id" element={page('jobs')} />
        <Route path="applications" element={page('applications')} />
        <Route path="applications/:id" element={page('applications')} />
        <Route path="profile" element={page('profile')} />
        <Route path="trust" element={page('trust')} />
        <Route path="notifications" element={page('notifications')} />
        <Route path="activity" element={<Navigate to="/notifications" replace />} />
        <Route path="settings/*" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default function App({ workspace, filters, notice }) {
  return (
    <BrowserRouter basename="/worker">
      <AppRoutes workspace={workspace} filters={filters} notice={notice} />
    </BrowserRouter>
  )
}
