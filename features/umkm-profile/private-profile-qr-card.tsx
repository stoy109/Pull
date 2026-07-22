"use client";

import Image from "next/image";
import { Download, Link2, QrCode, Share2, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeToLocation() {
  return () => undefined;
}

function getBrowserOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function PrivateProfileQrCard({
  businessName,
  publicProfilePath,
  onNotify,
}: {
  businessName: string;
  publicProfilePath: string;
  onNotify: (message: string) => void;
}) {
  const origin = useSyncExternalStore(subscribeToLocation, getBrowserOrigin, getServerOrigin);
  const publicProfileUrl = origin ? `${origin}${publicProfilePath}` : publicProfilePath;
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(publicProfileUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#0c4f36", light: "#ffffff" },
    })
      .then((value) => {
        if (active) setQrDataUrl(value);
      })
      .catch(() => {
        if (active) onNotify("QR Code belum dapat dibuat. Silakan coba lagi.");
      });
    return () => {
      active = false;
    };
  }, [onNotify, publicProfileUrl]);

  function downloadQrCode() {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profil-usaha"}-qr.png`;
    anchor.click();
    onNotify("QR Code berhasil diunduh.");
  }

  async function copyProfileLink() {
    await copyText(publicProfileUrl);
    onNotify("Link profil berhasil disalin.");
  }

  async function shareProfile() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Profil ${businessName} di Pull`,
          text: `Lihat profil usaha ${businessName} di Pull.`,
          url: publicProfileUrl,
        });
        onNotify("Profil berhasil dibagikan.");
      } else {
        await copyProfileLink();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      onNotify("Profil belum dapat dibagikan. Silakan coba lagi.");
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[20px] border border-[#dce7e1] bg-white shadow-[0_10px_30px_rgba(12,38,28,.055)]">
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-b border-[#e4ece7] bg-[#f7faf8] p-6 lg:border-b-0 lg:border-r">
          <div className="rounded-[22px] border border-[#dce7e1] bg-white p-4 shadow-[0_8px_24px_rgba(12,38,28,.07)]">
            {qrDataUrl ? <Image src={qrDataUrl} alt={`QR Code profil publik ${businessName}`} width={220} height={220} unoptimized className="h-[220px] w-[220px]" /> : <div className="grid h-[220px] w-[220px] place-items-center rounded-xl bg-[#f0f5f2]"><QrCode className="h-12 w-12 animate-pulse text-[#6c8e7f]" aria-label="Membuat QR Code" /></div>}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e7f5eb] text-[#07843f]"><QrCode className="h-5 w-5" /></span>
            <div><h3 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">QR Code Profil Usaha</h3><p className="mt-1 text-xs font-medium leading-5 text-[#718078]">Gunakan QR Code ini untuk mengarahkan pelanggan ke profil publik usaha Anda.</p></div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#f6f9f7] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#718078]">Nama UMKM</p>
            <p className="mt-1 text-sm font-extrabold text-[#244b3c]">{businessName}</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#718078]">Link profil publik</p>
            <p className="mt-1 break-all text-xs font-semibold leading-5 text-[#315b4c]">{publicProfileUrl}</p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button type="button" disabled={!qrDataUrl} onClick={downloadQrCode} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#07843f] px-3 text-[11px] font-extrabold text-white transition hover:bg-[#066f36] disabled:cursor-wait disabled:opacity-50"><Download className="h-4 w-4" /> Unduh QR</button>
            <button type="button" onClick={copyProfileLink} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#b8cfc2] px-3 text-[11px] font-extrabold text-[#08783d] transition hover:bg-[#f0f8f3]"><Link2 className="h-4 w-4" /> Salin Link</button>
            <button type="button" onClick={shareProfile} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#b8cfc2] px-3 text-[11px] font-extrabold text-[#08783d] transition hover:bg-[#f0f8f3]"><Share2 className="h-4 w-4" /> Bagikan</button>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[10px] font-semibold leading-5 text-[#718078]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16864c]" /> Fitur ini hanya tersedia di dashboard private pemilik UMKM. QR selalu mengarah ke halaman profil publik.</p>
        </div>
      </div>
    </section>
  );
}
