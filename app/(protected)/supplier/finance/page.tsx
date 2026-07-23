import { Banknote, CircleDollarSign, Clock3, ReceiptText } from "lucide-react";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatDate,
  SectionHeading,
  shortId,
  StatCard,
  StatusBadge,
} from "@/features/supplier/components/supplier-ui";
import { supplierOrderItemName } from "@/features/supplier/workspace";

export default async function SupplierFinancePage() {
  const { status, workspace } = await getSupplierWorkspace();
  if (status !== "ready") return <DataState status={status} />;

  const completed = workspace.orders.filter((order) => order.status === "completed");
  const pending = workspace.orders.filter((order) => order.status === "pending" || order.status === "accepted" || order.status === "processing" || order.status === "shipped");
  const completedTotal = completed.reduce((sum, order) => sum + order.total, 0);
  const pendingTotal = pending.reduce((sum, order) => sum + order.total, 0);
  const averageCompleted = completed.length ? completedTotal / completed.length : 0;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Nilai order selesai" value={formatCurrency(completedTotal)} detail={`${completed.length} pesanan dikonfirmasi selesai`} icon={CircleDollarSign} />
        <StatCard label="Nilai masih berjalan" value={formatCurrency(pendingTotal)} detail={`${pending.length} pesanan belum selesai`} icon={Clock3} tone="orange" />
        <StatCard label="Rata-rata order selesai" value={formatCurrency(averageCompleted)} detail="Dihitung hanya dari pesanan selesai" icon={Banknote} tone="blue" />
      </section>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Riwayat order" title="Arus nilai transaksi" description="Angka menggunakan total order supplier. Status pembayaran provider tidak disimpulkan dari status order." />
        {workspace.orders.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="border-b border-[#dfeae2] text-[9px] font-extrabold uppercase tracking-[.1em] text-[#6b7b75]"><th className="px-3 py-3">Order</th><th className="px-3 py-3">Tanggal</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Subtotal</th><th className="px-3 py-3 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-[#e3ece6]">{workspace.orders.map((order) => (
                <tr key={order.id} className="text-xs"><td className="px-3 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><ReceiptText className="h-4 w-4" /></span><div><p className="font-extrabold text-[#163c2b]">{supplierOrderItemName(workspace, order)}</p><p className="mt-1 text-[9px] font-semibold text-[#6b7b75]">{shortId(order.id)}</p></div></div></td><td className="px-3 py-4 font-semibold text-[#507f63]">{formatDate(order.createdAt)}</td><td className="px-3 py-4"><StatusBadge status={order.status} /></td><td className="px-3 py-4 text-right font-semibold text-[#507f63]">{formatCurrency(order.subtotal)}</td><td className="px-3 py-4 text-right font-extrabold text-[#08783f]">{formatCurrency(order.total)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState title="Belum ada riwayat keuangan" description="Nilai transaksi akan dihitung setelah order supplier dibuat." />}
      </section>
    </>
  );
}
