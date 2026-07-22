"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Store,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";

type ProfileMenuProps = {
  initials: string;
  ownerName: string;
  businessName: string;
  profileCompletion: number;
};

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-[#b42318] transition-colors hover:bg-[#fff4f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b42318] disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}

export function ProfileMenu({
  initials,
  ownerName,
  businessName,
  profileCompletion,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-16 w-full items-center gap-3 rounded-full border border-[#d8dfdc] bg-white py-2 pl-2.5 pr-4 text-left shadow-[0_3px_12px_rgba(18,59,48,0.07)] transition-colors hover:border-[#b8c9c0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c8c45] sm:w-[260px]"
      >
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#08783d] text-base font-medium text-white">
          {initials}
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#df3443]" aria-label="3 notifikasi baru" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold leading-tight text-[#111b17]">
            {ownerName}
          </span>
          <span className="mt-1 block whitespace-nowrap text-xs font-medium leading-tight text-[#69756f]">
            {profileCompletion}% profil bisnis lengkap
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#3b4d47] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#dfe6e2] bg-white px-4 py-5 shadow-[0_22px_60px_rgba(12,38,28,0.16)] sm:w-[312px]"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full bg-[#08783d] text-lg font-medium text-white">{initials}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[#111b17]">{ownerName}</p>
              <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-md bg-[#f0f7f2] px-2 py-1 text-[9px] font-semibold text-[#315c45]">
                <Store className="h-3 w-3 shrink-0" />
                <span className="truncate">{businessName} · Pemilik UMKM</span>
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 text-[10px] font-extrabold">
              <span className="text-[#2f3e38]">{profileCompletion}% profil lengkap</span>
              <Link href="#profil-bisnis" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1 whitespace-nowrap text-[#16844c] transition hover:text-[#086f3a]">
                Lengkapi profil <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e8ebea]">
                <div className="h-full rounded-full bg-[#16864c]" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-extrabold text-[#3e4b46]">{profileCompletion}%</span>
            </div>
          </div>

          <div className="mt-5 border-t border-[#e1e7e3] pt-4">
            <p className="mb-2 text-[9px] font-extrabold uppercase text-[#65736e]">Menu lainnya</p>
            <Link href="#profil-bisnis" role="menuitem" onClick={() => setIsOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg py-1.5 text-[11px] font-extrabold text-[#1d2924] transition hover:text-[#08783d]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edf7f0] text-[#247b4d]"><Store className="h-4 w-4" /></span>
              <span className="flex-1">Profil bisnis</span>
              <ChevronRight className="h-4 w-4 text-[#6f7c77]" />
            </Link>
            <Link href="#profil-bisnis" role="menuitem" onClick={() => setIsOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg py-1.5 text-[11px] font-extrabold text-[#1d2924] transition hover:text-[#08783d]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edf7f0] text-[#247b4d]"><Bell className="h-4 w-4" /></span>
              <span className="flex-1">Notifikasi</span>
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#df3443] text-[10px] font-extrabold text-white">3</span>
              <ChevronRight className="h-4 w-4 text-[#6f7c77]" />
            </Link>
          </div>

          <form action={signOutAction}>
            <SignOutButton />
          </form>
        </div>
      )}
    </div>
  );
}
