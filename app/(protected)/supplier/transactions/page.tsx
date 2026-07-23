import { Check, Clock3, PackageCheck, ReceiptText, Star, Truck, X } from "lucide-react";
import { setSupplierOrderStatusAction, submitTransactionRatingAction } from "@/features/supplier/actions";
import { getSupplierRatedOrderIds, getSupplierWorkspace } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatDate,
  formatNumber,
  inputClass,
  primaryButtonClass,
  SectionHeading,
  shortId,
  StatCard,
  StatusBadge,
  textareaClass,
} from "@/features/supplier/components/supplier-ui";
import { supplierOrderItemName, type SupplierOrder } from "@/features/supplier/workspace";

const transitionCopy = {
  accepted: { label: "Terima pesanan", icon: Check },
  rejected: { label: "Tolak", icon: X },
  processing: { label: "Mulai proses", icon: PackageCheck },
  shipped: { label: "Tandai dikirim", icon: Truck },
} as const;

function TransitionButton({ order, status, secondary = false }: { order: SupplierOrder; status: keyof typeof transitionCopy; secondary?: boolean }) {
  const item = transitionCopy[status];
  const Icon = item.icon;
  return (
    <form action={setSupplierOrderStatusAction}>
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={secondary ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ead4cd] bg-white px-4 text-xs font-extrabold text-[#a7462d] hover:bg-[#fff7f4]" : primaryButtonClass}><Icon className="h-4 w-4" />{item.label}</button>
    </form>
  );
}

export default async function SupplierTransactionsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [workspaceResult, ratedOrderIds, params] = await Promise.all([getSupplierWorkspace(), getSupplierRatedOrderIds(), searchParams]);
  if (workspaceResult.status !== "ready") return <DataState status={workspaceResult.status} />;
  const { workspace } = workspaceResult;
  const pending = workspace.orders.filter((order) => order.status === "pending");
  const inProgress = workspace.orders.filter((order) => order.status === "accepted" || order.status === "processing" || order.status === "shipped");
  const completed = workspace.orders.filter((order) => order.status === "completed");

  return (
    <>
      <ActionNotice result={params.result} />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Perlu keputusan" value={formatNumber(pending.length)} detail="Pesanan berstatus menunggu" icon={Clock3} tone={pending.length ? "orange" : "green"} />
        <StatCard label="Dalam pemenuhan" value={formatNumber(inProgress.length)} detail="Diterima, diproses, atau dikirim" icon={Truck} tone="blue" />
        <StatCard label="Selesai" value={formatNumber(completed.length)} detail="Dikonfirmasi selesai oleh pembeli" icon={PackageCheck} />
      </section>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Daftar order" title="Transaksi supplier" description="Aksi yang tampil mengikuti transisi status yang diizinkan untuk supplier." />
        {workspace.orders.length ? (
          <div className="mt-5 space-y-4">
            {workspace.orders.map((order) => {
              const itemName = supplierOrderItemName(workspace, order);
              const canRate = order.status === "completed" && !ratedOrderIds.has(order.id);
              return (
                <article key={order.id} className="rounded-[18px] border border-[#dfeae2] bg-[#fcfdfc] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><ReceiptText className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-[#6b7b75]">{shortId(order.id)} · {formatDate(order.createdAt, true)}</p><h3 className="mt-1.5 truncate text-base font-extrabold text-[#163c2b]">{itemName}</h3><p className="mt-1 text-[10px] font-semibold text-[#6b7b75]">{formatNumber(order.quantity)} {order.unit} × {formatCurrency(order.unitPrice)}</p></div></div>
                    <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end"><StatusBadge status={order.status} /><strong className="text-base text-[#08783f]">{formatCurrency(order.total)}</strong></div>
                  </div>

                  <div className="mt-4 border-t border-[#e3ece6] pt-4">
                    {order.status === "pending" ? <div className="flex flex-wrap gap-2"><TransitionButton order={order} status="accepted" /><TransitionButton order={order} status="rejected" secondary /></div> : null}
                    {order.status === "accepted" ? <TransitionButton order={order} status="processing" /> : null}
                    {order.status === "processing" ? <TransitionButton order={order} status="shipped" /> : null}
                    {order.status === "shipped" ? <p className="rounded-xl bg-[#e9f2ff] px-4 py-3 text-xs font-bold text-[#285c91]">Barang ditandai dikirim. Menunggu pembeli mengonfirmasi penyelesaian.</p> : null}
                    {order.status === "rejected" || order.status === "cancelled" ? <p className="text-xs font-semibold text-[#7b8781]">Tidak ada tindakan lanjutan untuk pesanan ini.</p> : null}
                    {order.status === "completed" && ratedOrderIds.has(order.id) ? <p className="flex items-center gap-2 text-xs font-bold text-[#08783f]"><Star className="h-4 w-4 fill-current" />Rating transaksi sudah dikirim.</p> : null}
                    {canRate ? (
                      <details className="group">
                        <summary className="cursor-pointer list-none text-xs font-extrabold text-[#08783f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">Beri rating kepada pembeli</summary>
                        <form action={submitTransactionRatingAction} className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                          <input type="hidden" name="orderId" value={order.id} />
                          <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Nilai<select className={inputClass} name="score" defaultValue="5" required><option value="5">5 — Sangat baik</option><option value="4">4 — Baik</option><option value="3">3 — Cukup</option><option value="2">2 — Kurang</option><option value="1">1 — Buruk</option></select></label>
                          <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Ulasan opsional<textarea className={`${textareaClass} min-h-11`} name="review" minLength={3} maxLength={1000} /></label>
                          <button type="submit" className={primaryButtonClass}><Star className="h-4 w-4" />Kirim rating</button>
                        </form>
                      </details>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Belum ada transaksi" description="Pesanan akan tampil saat UMKM membuat order dari penawaran suppliermu." />}
      </section>
    </>
  );
}
