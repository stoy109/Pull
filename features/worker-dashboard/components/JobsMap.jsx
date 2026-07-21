'use client'

import dynamic from 'next/dynamic'

const JobsMapInner = dynamic(() => import('./JobsMapInner'), {
  ssr: false,
  loading: () => <div className="grid min-h-[620px] place-items-center bg-pull-50 text-[11px] font-extrabold text-pull-500">Memuat peta Solo Raya...</div>,
})

export default function JobsMap(props) {
  return <JobsMapInner {...props} />
}
