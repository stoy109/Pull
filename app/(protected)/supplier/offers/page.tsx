import { CheckCircle2, HandCoins, PackageOpen, ReceiptText } from "lucide-react";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatDate,
  formatNumber,
  SectionHeading,
  StatCard,
  StatusBadge,
} from "@/features/supplier/components/supplier-ui";

export default async function SupplierOffersPage() {
  const { status, workspace } = await getSupplierWorkspace();
  if (status !== "ready") return <DataState status={status} />;

  const activeOffers = workspace.poolOffers.filter((offer) => offer.status === "active");
  const orderedOfferIds = new Set(workspace.orders.map((order) => order.offerId));
  const matchedOffers = workspace.poolOffers.filter((offer) => orderedOfferIds.has(offer.id));
  const demandById = new Map(workspace.demands.map((demand) => [demand.id, demand]));

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total penawaran" value={formatNumber(workspace.poolOffers.length)} detail="Penawaran yang dikirim terhadap pool" icon={HandCoins} />
        <StatCard label="Masih aktif" value={formatNumber(activeOffers.length)} detail="Penawaran dapat dipilih selama pool tersedia" icon={CheckCircle2} />
        <StatCard label="Menjadi pesanan" value={formatNumber(matchedOffers.length)} detail="Penawaran yang sudah memiliki order" icon={ReceiptText} tone="blue" />
      </section>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Riwayat penawaran" title="Penawaran pool terkirim" description="Harga dan kemampuan pasok yang pernah dikirim. Penawaran pool tidak mengubah katalog bahan baku." />
        {workspace.poolOffers.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {workspace.poolOffers.map((offer) => {
              const demand = demandById.get(offer.poolId);
              const ordered = orderedOfferIds.has(offer.id);
              return (
                <article key={offer.id} className="rounded-[18px] border border-[#dfeae2] bg-[#fcfdfc] p-5">
                  <div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-5 w-5" /></span>{ordered ? <span className="rounded-full bg-[#e9f2ff] px-2.5 py-1 text-[9px] font-extrabold text-[#0868d7]">Menjadi pesanan</span> : <StatusBadge status={offer.status} />}</div>
                  <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#6b7b75]">{offer.category || "Tanpa kategori"}</p>
                  <h3 className="mt-1.5 text-base font-extrabold text-[#163c2b]">{offer.itemName || "Penawaran tanpa nama"}</h3>
                  <p className="mt-2 text-[10px] font-semibold text-[#6b7b75]">Dikirim {formatDate(offer.createdAt)}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white p-3"><dt className="text-[8px] font-bold text-[#6b7b75]">Harga</dt><dd className="mt-1 text-[10px] font-extrabold text-[#08783f]">{formatCurrency(offer.unitPrice)}</dd></div><div className="rounded-xl bg-white p-3"><dt className="text-[8px] font-bold text-[#6b7b75]">Pasokan</dt><dd className="mt-1 text-[10px] font-extrabold text-[#163c2b]">{formatNumber(offer.stockQuantity)} {offer.unit}</dd></div><div className="rounded-xl bg-white p-3"><dt className="text-[8px] font-bold text-[#6b7b75]">MOQ</dt><dd className="mt-1 text-[10px] font-extrabold text-[#163c2b]">{formatNumber(offer.minOrderQuantity)} {offer.unit}</dd></div></dl>
                  {offer.description ? <p className="mt-4 text-[10px] font-medium leading-5 text-[#6b7b75]">{offer.description}</p> : null}
                  <div className="mt-4 border-t border-[#e3ece6] pt-3 text-[9px] font-semibold text-[#507f63]">{demand ? `Pool aktif · tenggat ${formatDate(demand.deadline)}` : "Pool tidak lagi berada di demand aktif"}</div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Belum ada penawaran pool" description="Riwayat penawaran pool yang sudah ada akan tampil di sini." />}
      </section>
    </>
  );
}
