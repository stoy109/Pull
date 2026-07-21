import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, ChevronDown } from 'lucide-react'

const options = [
  { value: 'Siap menerima tawaran', detail: 'Profil tampil normal di hasil pencarian', color: 'bg-[#54a776]' },
  { value: 'Terbatas', detail: 'Hanya tampil untuk loker yang sangat cocok', color: 'bg-[#d59a45]' },
  { value: 'Tidak tersedia', detail: 'Matching baru dijeda sementara', color: 'bg-pull-300' },
]

export default function AvailabilityDropdown({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const menuId = useId()
  const selected = options.find((option) => option.value === value) || options[0]

  useLayoutEffect(() => {
    if (!open) return undefined
    const menu = rootRef.current?.querySelector('[role="listbox"]')
    if (!menu) return undefined

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(menu, { autoAlpha: 0, y: -8, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.26, clearProps: 'opacity,visibility,transform' })
        .fromTo(menu.querySelectorAll('[role="option"]'), { autoAlpha: 0, y: -4 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.035, clearProps: 'opacity,visibility,transform' }, '-=0.14')
    })
    return () => media.revert()
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const choose = (nextValue) => {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${compact ? 'w-fit' : 'w-full'}`}>
      <button type="button" onClick={() => setOpen((current) => !current)} className={compact ? 'availability-pill' : 'flex w-full items-center gap-3 rounded-2xl border border-pull-100 p-4 text-left transition hover:border-pull-200 hover:bg-pull-50/50'} aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId}>
        <span className={`${compact ? 'size-2' : 'size-3'} shrink-0 rounded-full ${selected.color}`} />
        {compact ? <span className="text-[10px] font-extrabold text-pull-700">{selected.value}</span> : <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-pull-900">{selected.value}</span><span className="mt-1 block text-[9px] text-pull-400">{selected.detail}</span></span>}
        <ChevronDown size={compact ? 13 : 15} className={`shrink-0 text-pull-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div id={menuId} role="listbox" aria-label="Status ketersediaan" className={`absolute left-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-pull-100 bg-white p-2 shadow-[0_22px_60px_rgba(12,38,28,0.16)] ${compact ? 'w-[min(290px,calc(100vw-32px))]' : 'right-0'}`}><div className="px-2.5 pb-2 pt-1"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-pull-400">Status ketersediaan</p><p className="mt-1 text-[9px] leading-4 text-pull-500">Perubahan langsung mengatur visibilitas profilmu.</p></div><div className="space-y-1">{options.map((option) => { const active = option.value === value; return <button key={option.value} type="button" onClick={() => choose(option.value)} role="option" aria-selected={active} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${active ? 'border-pull-200 bg-pull-50' : 'border-transparent hover:bg-pull-50/70'}`}><span className={`size-2.5 shrink-0 rounded-full ${option.color}`} /><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold text-pull-800">{option.value}</span><span className="mt-0.5 block text-[8px] leading-4 text-pull-400">{option.detail}</span></span>{active ? <Check size={14} className="shrink-0 text-pull-700" /> : null}</button> })}</div></div> : null}
    </div>
  )
}
