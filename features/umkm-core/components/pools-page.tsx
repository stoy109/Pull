import {
  Clock3,
  LogOut,
  MapPin,
  PackageOpen,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingDown,
  UsersRound,
} from "lucide-react";
import {
  createPoolAction,
  createSupplierOrderAction,
  deletePoolAction,
  joinPoolAction,
  leavePoolAction,
  setBuyerOrderStatusAction,
} from "../actions";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  orderStatusLabel,
  poolStatusLabel,
  savingsPercent,
} from "../format";
import type { BuyerOrder, Pool, PoolsWorkspace, SupplierCatalogProduct } from "../types";
import { PersistedPoolMap } from "./pool-map";
import {
  ActionNotice,
  DashboardFrame,
  DataErrorPanel,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./dashboard-frame";

function StatusBadge({ status }: { status: string }) {
  const completed = ["fulfilled", "completed"].includes(status);
  const failed = ["cancelled", "expired", "rejected"].includes(status);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
        completed
          ? "bg-[#e6f5ea] text-[#16703d]"
          : failed
            ? "bg-[#fdebed] text-[#aa3348]"
            : "bg-[#fff4db] text-[#94620d]"
      }`}
    >
      {poolStatusLabel(status)}
    </span>
  );
}

function PoolCard({ pool }: { pool: Pool }) {
  const canOrder =
    pool.isOwner &&
    ["threshold_met", "ready"].includes(pool.status) &&
    pool.currentQuantity >= pool.minThreshold;
  const bestPrice = pool.tier2Price ?? pool.tier1Price;
  const bestSavings = savingsPercent(pool.marketPrice, bestPrice);
  const savingsValue =
    pool.marketPrice && bestPrice && pool.marketPrice > bestPrice
      ? (pool.marketPrice - bestPrice) * pool.targetQuantity
      : 0;

  return (
    <article className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(18,59,48,.04)]">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f4eb] text-[#087447]">
          <PackageOpen className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold text-[#10231d]">{pool.itemName}</h3>
            <StatusBadge status={pool.status} />
            {pool.isOwner ? (
              <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[9px] font-extrabold text-[#426394]">Milik Anda</span>
            ) : null}
            {pool.joinedQuantity !== null ? (
              <span className="rounded-full bg-[#e9f6ed] px-2.5 py-1 text-[9px] font-extrabold text-[#16703d]">Sudah bergabung</span>
            ) : null}
          </div>
          <p className="mt-1 text-[10px] font-bold text-[#718078]">{pool.category}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium leading-5 text-[#596a62]">{pool.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] font-bold text-[#40534a]">
        <span>
          {formatNumber(pool.currentQuantity)} / {formatNumber(pool.targetQuantity)} {pool.unit}
        </span>
        <span>{formatPercent(pool.progress)}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e6ece8]">
        <div className="h-full rounded-full bg-[#087447]" style={{ width: `${pool.progress}%` }} />
      </div>
      <p className="mt-2 text-[10px] font-semibold text-[#718078]">
        Ambang diskon {formatNumber(pool.minThreshold)} {pool.unit}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[#f6f9f7] p-3">
          <dt className="text-[9px] font-bold text-[#75857d]">Harga pasar</dt>
          <dd className="mt-1 text-[11px] font-extrabold text-[#26372f]">
            {pool.marketPrice === null ? "—" : formatCurrency(pool.marketPrice)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#f0f7f2] p-3">
          <dt className="text-[9px] font-bold text-[#65806f]">Harga normal</dt>
          <dd className="mt-1 text-[11px] font-extrabold text-[#087447]">
            {pool.tier1Price === null ? "—" : formatCurrency(pool.tier1Price)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#fff8e8] p-3">
          <dt className="text-[9px] font-bold text-[#8a753f]">Harga diskon</dt>
          <dd className="mt-1 text-[11px] font-extrabold text-[#9a670f]">
            {pool.tier2Price === null ? "—" : formatCurrency(pool.tier2Price)}
          </dd>
        </div>
      </dl>

      {bestSavings > 0 ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff8e8] px-3 py-2.5 text-[10px] font-bold leading-5 text-[#76581c]">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0" />
          Potensi hemat {formatPercent(bestSavings)} atau {formatCurrency(savingsValue)} setelah ambang diskon tercapai.
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 text-[10px] font-semibold text-[#64746c] sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{pool.district}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(pool.deadline)}</span>
        <span className="inline-flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" />Hub: {pool.hub ?? "Belum ditentukan"}</span>
      </div>

      {pool.joinedQuantity !== null ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#d7e8dd] bg-[#f3faf5] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-bold text-[#276443]">
            Kontribusi Anda: {formatNumber(pool.joinedQuantity)} {pool.unit}
          </p>
          {pool.leavable ? (
            <form action={leavePoolAction}>
              <input type="hidden" name="poolId" value={pool.id} />
              <button className={`${secondaryButtonClass} w-full gap-2 border-[#e3a8b2] text-[#a72e43] hover:bg-[#fff3f5] sm:w-auto`}>
                <LogOut className="h-4 w-4" />Keluar pool
              </button>
            </form>
          ) : (
            <span className="text-[9px] font-semibold text-[#9a6b3d]">Terkunci karena pesanan supplier sudah dibuat.</span>
          )}
        </div>
      ) : pool.joinable ? (
        <form action={joinPoolAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="poolId" value={pool.id} />
          <label className="min-w-0 flex-1">
            <span className="sr-only">Jumlah untuk bergabung ke {pool.itemName}</span>
            <input
              className={inputClass}
              max={Math.max(0, pool.targetQuantity - pool.currentQuantity)}
              min="0.001"
              name="quantity"
              placeholder={`Jumlah (${pool.unit})`}
              required
              step="0.001"
              type="number"
            />
          </label>
          <button className={primaryButtonClass}>Gabung pool</button>
        </form>
      ) : null}

      {pool.deletable ? (
        <details className="mt-4 rounded-xl border border-[#efcfd4] bg-[#fff7f7] p-3">
          <summary className="cursor-pointer list-none text-[10px] font-extrabold text-[#a72e43]">Hapus pool</summary>
          <p className="mt-2 text-[10px] font-medium leading-5 text-[#76545a]">Pool dan seluruh keanggotaannya akan dihapus permanen.</p>
          <form action={deletePoolAction} className="mt-3">
            <input type="hidden" name="poolId" value={pool.id} />
            <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#a72e43] px-4 text-[10px] font-extrabold text-white focus:outline-none focus:ring-4 focus:ring-[#a72e43]/20">
              <Trash2 className="h-4 w-4" />Ya, hapus pool
            </button>
          </form>
        </details>
      ) : pool.isOwner ? (
        <p className="mt-4 text-[10px] font-semibold text-[#718078]">Pool dengan riwayat pesanan tidak dapat dihapus.</p>
      ) : null}

      {canOrder ? (
        <section className="mt-5 border-t border-[#e3ebe6] pt-4">
          <h4 className="text-xs font-extrabold text-[#244b3c]">Penawaran supplier</h4>
          <p className="mt-1 text-[10px] font-medium leading-4 text-[#718078]">
            Pilih penawaran yang dapat memenuhi jumlah pool saat ini.
          </p>
          <div className="mt-3 space-y-2">
            {pool.offers.length ? (
              pool.offers.map((offer, index) => {
                const orderable =
                  offer.stockQuantity >= pool.currentQuantity &&
                  pool.currentQuantity >= offer.minOrderQuantity;
                return (
                  <form
                    action={createSupplierOrderAction}
                    className="rounded-xl border border-[#dfe8e2] bg-[#f9fbfa] p-3"
                    key={offer.id}
                  >
                    <input type="hidden" name="poolId" value={pool.id} />
                    <input type="hidden" name="offerId" value={offer.id} />
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-extrabold text-[#315b4c]">Penawaran {index + 1}</p>
                        <p className="mt-1 text-xs font-extrabold text-[#10231d]">{formatCurrency(offer.unitPrice)} / {pool.unit}</p>
                      </div>
                      <p className="text-right text-[9px] font-semibold leading-4 text-[#718078]">
                        Stok {formatNumber(offer.stockQuantity)} {pool.unit}<br />
                        Minimum {formatNumber(offer.minOrderQuantity)} {pool.unit}
                      </p>
                    </div>
                    {offer.description ? <p className="mt-2 text-[10px] leading-4 text-[#68776f]">{offer.description}</p> : null}
                    {orderable ? (
                      <div className="mt-3">
                        <input name="quantity" type="hidden" value={pool.currentQuantity} />
                        <button className={primaryButtonClass}>
                          <ShoppingCart className="mr-2 h-4 w-4" />Pesan {formatNumber(pool.currentQuantity)} {pool.unit}
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] font-bold text-[#aa3348]">Stok supplier belum cukup untuk memenuhi seluruh jumlah pool.</p>
                    )}
                  </form>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-[#cbdad2] p-4 text-center text-[10px] font-semibold text-[#718078]">
                Belum ada penawaran supplier untuk pool ini.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function PoolSection({ empty, pools, title }: { empty: string; pools: Pool[]; title: string }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold text-[#10231d]">{title}</h2>
        <span className="rounded-full bg-[#e7f3eb] px-3 py-1 text-[10px] font-extrabold text-[#087447]">{pools.length}</span>
      </div>
      {pools.length ? (
        <div className="grid gap-4 xl:grid-cols-2">{pools.map((pool) => <PoolCard key={pool.id} pool={pool} />)}</div>
      ) : (
        <p className="rounded-[20px] border border-dashed border-[#cad9d1] bg-white p-8 text-center text-sm font-semibold text-[#718078]">{empty}</p>
      )}
    </section>
  );
}

function OrderCard({ order }: { order: BuyerOrder }) {
  const canCancel = order.status === "pending";
  const canComplete = order.status === "shipped";
  return (
    <article className="rounded-2xl border border-[#dce7e1] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#17362a]">{order.itemName}</h3>
          <p className="mt-1 text-[10px] font-semibold text-[#718078]">Dibuat {formatDate(order.createdAt)}</p>
        </div>
        <span className="rounded-full bg-[#edf4f0] px-2.5 py-1 text-[9px] font-extrabold text-[#315b4c]">{orderStatusLabel(order.status)}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
        <div><p className="font-bold text-[#718078]">Jumlah</p><p className="mt-1 font-extrabold text-[#26372f]">{formatNumber(order.quantity)} {order.unit}</p></div>
        <div><p className="font-bold text-[#718078]">Harga</p><p className="mt-1 font-extrabold text-[#26372f]">{formatCurrency(order.unitPrice)}</p></div>
        <div><p className="font-bold text-[#718078]">Total</p><p className="mt-1 font-extrabold text-[#087447]">{formatCurrency(order.total)}</p></div>
      </div>
      {canCancel || canComplete ? (
        <form action={setBuyerOrderStatusAction} className="mt-4">
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="status" value={canCancel ? "cancelled" : "completed"} />
          <button className={canCancel ? secondaryButtonClass : primaryButtonClass}>
            {canCancel ? "Batalkan pesanan" : "Konfirmasi pesanan diterima"}
          </button>
        </form>
      ) : null}
    </article>
  );
}

function CreatePoolForm({ catalogProducts }: { catalogProducts: SupplierCatalogProduct[] }) {
  return (
    <details className="group rounded-[22px] border border-[#dce7e1] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-extrabold text-[#17362a] sm:p-6">
        <span className="inline-flex items-center gap-2"><Plus className="h-5 w-5 text-[#087447]" />Buat pool dari katalog supplier</span>
        <span className="text-[10px] font-bold text-[#718078] group-open:hidden">Buka formulir</span>
      </summary>
      {catalogProducts.length ? (
        <form action={createPoolAction} className="border-t border-[#e3ebe6] p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2" label="Produk bahan baku supplier *" hint="Setiap grup memisahkan satu produk. Harga, stok, ambang jumlah, dan diskon berasal dari supplier.">
              <select className={inputClass} name="catalogProductId" required defaultValue="">
                <option disabled value="">Pilih produk katalog</option>
                {catalogProducts.map((product, index) => (
                  <optgroup key={product.id} label={`Produk ${index + 1} — ${product.itemName} · diskon ${formatNumber(product.targetDiscount)}%`}>
                    <option value={product.id}>
                      {product.itemName} · diskon {formatNumber(product.targetDiscount)}% · {formatCurrency(product.unitPrice)}/{product.unit} · minimum {formatNumber(product.minOrderQuantity)} {product.unit} · stok {formatNumber(product.stockQuantity)} {product.unit}
                    </option>
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Kecamatan *"><input className={inputClass} maxLength={120} minLength={2} name="district" required /></Field>
            <Field className="md:col-span-2" label="Hub pengambilan"><input className={inputClass} maxLength={200} name="hub" placeholder="Alamat atau nama titik kumpul" /></Field>
          </div>
          <p className="mt-4 text-[10px] font-semibold leading-5 text-[#64746c]">Target pool otomatis sama dengan minimum jumlah untuk diskon dari supplier. Pool dimulai dengan batas waktu 1 jam; join pertama tiap akun memperbarui batas waktu menjadi 1 jam berikutnya.</p>
          <button className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}>Buat pool</button>
        </form>
      ) : (
        <p className="border-t border-[#e3ebe6] p-5 text-xs font-semibold leading-6 text-[#718078] sm:p-6">Belum ada produk katalog supplier aktif dengan stok yang dapat dipilih.</p>
      )}
    </details>
  );
}

export function PoolsPageView({
  error,
  identity,
  notice,
  workspace,
}: {
  error: string | null;
  identity: Parameters<typeof DashboardFrame>[0]["identity"];
  notice: { error?: string; success?: string };
  workspace: PoolsWorkspace | null;
}) {
  const mappedPools = workspace
    ? Array.from(new Map([...workspace.openPools, ...workspace.ownedPools, ...workspace.joinedPools].map((pool) => [pool.id, pool])).values())
    : [];

  return (
    <DashboardFrame identity={identity}>
      <ActionNotice {...notice} />
      {error || !workspace ? (
        <DataErrorPanel message={error ?? "Data pool belum tersedia."} />
      ) : (
        <>
          <CreatePoolForm catalogProducts={workspace.catalogProducts} />
          <PersistedPoolMap pools={mappedPools} />
          <PoolSection empty="Belum ada pool yang menerima anggota." pools={workspace.openPools} title="Pool terbuka" />
          <PoolSection empty="Anda belum membuat pool." pools={workspace.ownedPools} title="Pool milik Anda" />
          <PoolSection empty="Anda belum bergabung ke pool." pools={workspace.joinedPools} title="Pool yang Anda ikuti" />
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-[#10231d]">Pesanan supplier milik Anda</h2>
              <span className="rounded-full bg-[#e7f3eb] px-3 py-1 text-[10px] font-extrabold text-[#087447]">{workspace.orders.length}</span>
            </div>
            {workspace.orders.length ? (
              <div className="grid gap-4 xl:grid-cols-2">{workspace.orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
            ) : (
              <p className="rounded-[20px] border border-dashed border-[#cad9d1] bg-white p-8 text-center text-sm font-semibold text-[#718078]">Belum ada pesanan supplier dari pool milik Anda.</p>
            )}
          </section>
        </>
      )}
    </DashboardFrame>
  );
}
