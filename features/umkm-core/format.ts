const currencyFormatter = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Tanggal tidak tersedia" : dateFormatter.format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateTimeFormatter.format(date);
}

export function formatPercent(value: number) {
  return `${Math.max(0, value).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
}

export function poolStatusLabel(status: string) {
  const labels: Record<string, string> = {
    cancelled: "Dibatalkan",
    expired: "Kedaluwarsa",
    fulfilled: "Selesai",
    open: "Terbuka",
    ordered: "Dipesan",
    ready: "Siap dipesan",
    threshold_met: "Ambang terpenuhi",
  };
  return labels[status] ?? status;
}

export function jobStatusLabel(status: string) {
  const labels: Record<string, string> = {
    closed: "Ditutup",
    draft: "Draf",
    published: "Terbit",
  };
  return labels[status] ?? status;
}

export function applicationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Diterima",
    completed: "Selesai",
    rejected: "Ditolak",
    submitted: "Menunggu keputusan",
    withdrawn: "Ditarik pekerja",
  };
  return labels[status] ?? status;
}

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Diterima supplier",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    pending: "Menunggu supplier",
    processing: "Diproses",
    rejected: "Ditolak supplier",
    shipped: "Dikirim",
  };
  return labels[status] ?? status;
}

export function savingsPercent(marketPrice: number | null, poolPrice: number | null) {
  if (!marketPrice || poolPrice === null || poolPrice >= marketPrice) return 0;
  return ((marketPrice - poolPrice) / marketPrice) * 100;
}
