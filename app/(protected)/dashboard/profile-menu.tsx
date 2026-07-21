"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";

type ProfileMenuProps = {
  initials: string;
  ownerName: string;
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

export function ProfileMenu({ initials, ownerName }: ProfileMenuProps) {
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
        className="flex h-16 w-full items-center gap-3 rounded-2xl border border-[#e1e9e4] bg-white px-4 text-left shadow-sm shadow-emerald-950/5 transition-colors hover:border-[#b8d4c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c8c45] sm:w-[220px]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dff2e7] text-sm font-extrabold text-[#145c46]">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-extrabold leading-tight text-[#10231d]">
            {ownerName}
          </span>
          <span className="mt-1 block text-sm font-bold leading-tight text-[#6b7b75]">
            UMKM Owner
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
          className="absolute right-0 z-30 mt-2 w-full min-w-48 rounded-xl border border-[#e1e9e4] bg-white p-1.5 shadow-xl shadow-emerald-950/10 sm:w-[220px]"
        >
          <Link
            href="#profil-bisnis"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-[#29483d] transition-colors hover:bg-[#f1f8f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c8c45]"
          >
            <UserRound className="h-4 w-4" />
            Profil
          </Link>
          <div className="my-1 border-t border-[#edf2ef]" />
          <form action={signOutAction}>
            <SignOutButton />
          </form>
        </div>
      )}
    </div>
  );
}
