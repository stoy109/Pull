"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const DISMISSED_KEY = "pull-pwa-install-dismissed-at";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as NavigatorWithStandalone).standalone === true;
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    return;
  }
}

function clearDismissal() {
  try {
    window.localStorage.removeItem(DISMISSED_KEY);
  } catch {
    return;
  }
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore service worker registration failures in development.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    if (!isMobile() || isStandalone()) return;

    const canShow = !recentlyDismissed();
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (canShow) setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      clearDismissal();
      setInstallPrompt(null);
      setShowIOSInstructions(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    const iosTimer = isIOS && canShow
      ? window.setTimeout(() => setShowIOSInstructions(true), 1200)
      : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    rememberDismissal();
    setInstallPrompt(null);
    setShowIOSInstructions(false);
  };

  const install = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "dismissed") rememberDismissal();
    } catch {
      return;
    } finally {
      setInstallPrompt(null);
    }
  };

  if (!installPrompt && !showIOSInstructions) return null;

  return (
    <aside
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      className="fixed inset-x-3 bottom-[calc(88px+env(safe-area-inset-bottom))] z-110 mx-auto max-w-sm overflow-hidden rounded-[22px] border border-[#cfe3d6] bg-white p-4 text-pull-950 shadow-[0_24px_70px_rgba(7,45,29,.24)] md:hidden"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[15px] bg-[#08783f] text-xl font-black text-white shadow-[0_8px_20px_rgba(8,120,63,.22)]">P</span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-pull-500">Akses lebih cepat</p>
          <h2 id="pwa-install-title" className="mt-1 text-base font-extrabold">Pasang Pull di ponsel</h2>
        </div>
        <button type="button" onClick={dismiss} className="grid size-9 shrink-0 place-items-center rounded-xl text-pull-500 transition hover:bg-[#f0f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]" aria-label="Tutup penawaran instalasi">
          <X className="size-4" />
        </button>
      </div>

      <p id="pwa-install-description" className="mt-3 text-[11px] font-medium leading-5 text-pull-500">
        {showIOSInstructions
          ? "Ketuk Bagikan di browser, lalu pilih Tambahkan ke Layar Utama."
          : "Buka Pull langsung dari layar utama seperti aplikasi biasa."}
      </p>

      {showIOSInstructions ? (
        <button type="button" onClick={dismiss} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08783f] text-xs font-extrabold text-white transition hover:bg-[#00613f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">
          <Share2 className="size-4" /> Mengerti
        </button>
      ) : (
        <button type="button" onClick={install} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08783f] text-xs font-extrabold text-white transition hover:bg-[#00613f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">
          <Download className="size-4" /> Tambahkan ke layar utama
        </button>
      )}
    </aside>
  );
}