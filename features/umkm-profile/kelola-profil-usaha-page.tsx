"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  ImagePlus,
  MapPin,
  Pencil,
  ShieldCheck,
  Star,
  Store,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { PrivateProfileQrCard } from "@/features/umkm-profile/private-profile-qr-card";

type ActiveModal = null | "edit_info" | "product_form" | "confirm_delete";
type ProductFormMode = "add" | "edit";

type BusinessInfo = {
  banner: string;
  logo: string;
  name: string;
  category: string;
  scale: string;
  businessType: string;
  description: string;
  paymentMethods: string[];
  foundedYear: string;
  whatsappContact: string;
};

type Product = {
  id: string;
  name: string;
  image: string;
  imagePosition: string;
};

const INITIAL_INFO: BusinessInfo = {
  banner: "/auth/slides/01-belanja-bareng.webp",
  logo: "/illustrations/batik-laweyan-logo.svg",
  name: "Batik Laweyan Bu Sari",
  category: "Batik / Tekstil",
  scale: "Kecil",
  businessType: "Produksi",
  description:
    "Memproduksi batik tulis & cap untuk fashion dan home decor. Melayani pesanan custom motif.",
  paymentMethods: ["Transfer Bank", "Tunai", "QRIS"],
  foundedYear: "2010",
  whatsappContact: "628123456790",
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "product-parang",
    name: "Batik Tulis Motif Parang",
    image: "/auth/slides/01-belanja-bareng.webp",
    imagePosition: "50% 72%",
  },
  {
    id: "product-kawung-cap",
    name: "Batik Cap Kawung",
    image: "/auth/slides/03-dari-lapak-ke-layar.webp",
    imagePosition: "50% 70%",
  },
  {
    id: "product-kawung-tulis",
    name: "Batik Tulis Kawung",
    image: "/auth/slides/04-reputasi-terjaga.webp",
    imagePosition: "50% 72%",
  },
  {
    id: "product-sarung-bantal",
    name: "Sarung Bantal Batik",
    image: "/auth/slides/02-tenaga-lokal.webp",
    imagePosition: "50% 72%",
  },
];

const PAYMENT_OPTIONS = ["Transfer Bank", "Tunai", "QRIS", "E-Wallet", "Kartu Debit"];
const PRODUCTS_PER_PAGE = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PUBLIC_PROFILE_PREVIEW_KEY = "pull:umkm-public-profile-preview";

function createProfileSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "profil-usaha";
}

function readImageFile(file: File, onSuccess: (value: string) => void, onError: (message: string) => void) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    onError("Gunakan gambar berformat JPG, PNG, atau WEBP.");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    onError("Ukuran gambar maksimal 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => onSuccess(String(reader.result));
  reader.onerror = () => onError("Gambar gagal dibaca. Silakan coba lagi.");
  reader.readAsDataURL(file);
}

function ModalFrame({
  title,
  titleId,
  onClose,
  children,
  size = "large",
}: {
  title: string;
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}) {
  const width = size === "small" ? "sm:max-w-md" : size === "medium" ? "sm:max-w-2xl" : "sm:max-w-4xl";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#052b20]/45 backdrop-blur-[2px] sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-[#dfe9e3] bg-white shadow-[0_28px_80px_rgba(12,38,28,.24)] sm:rounded-[24px] ${width}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e4ece7] px-5 py-4 sm:px-6">
          <h2 id={titleId} className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Tutup ${title}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#53665e] transition-colors hover:bg-[#f0f6f2] hover:text-[#0c261c]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs font-extrabold text-[#29483d]">{children}</span>;
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#dce7e1] bg-white px-3.5 text-sm font-medium text-[#17362a] outline-none transition placeholder:text-[#9aa8a2] focus:border-[#16864c] focus:ring-4 focus:ring-[#16864c]/10";

function PreviewImage({
  src,
  alt,
  className,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src.startsWith("data:")}
      sizes="(max-width: 768px) 100vw, 800px"
      className={className ?? "object-cover"}
      style={{ objectPosition }}
    />
  );
}

export function KelolaProfilUsahaPage({
  ownerName,
  businessName,
  profileCompletion,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [productFormMode, setProductFormMode] = useState<ProductFormMode>("add");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<BusinessInfo>(() => ({ ...INITIAL_INFO, name: businessName || INITIAL_INFO.name }));
  const [infoDraft, setInfoDraft] = useState<BusinessInfo>(info);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productDraft, setProductDraft] = useState({ name: "", image: "" });
  const [productError, setProductError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = products.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (!activeModal) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModal(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeModal]);

  function closeModal() {
    setActiveModal(null);
    setProductError("");
  }

  function openInfoEditor() {
    setInfoDraft({ ...info, paymentMethods: [...info.paymentMethods] });
    setActiveModal("edit_info");
  }

  function openProductForm(mode: ProductFormMode, product?: Product) {
    setProductFormMode(mode);
    setSelectedProductId(product?.id ?? null);
    setProductDraft({ name: product?.name ?? "", image: product?.image ?? "" });
    setProductError("");
    setActiveModal("product_form");
  }

  function openDeleteConfirmation(product: Product) {
    setSelectedProductId(product.id);
    setActiveModal("confirm_delete");
  }

  function handleInfoImage(field: "banner" | "logo", file?: File) {
    if (!file) return;
    readImageFile(
      file,
      (value) => setInfoDraft((current) => ({ ...current, [field]: value })),
      setToastMessage,
    );
  }

  function saveInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInfo({ ...infoDraft, paymentMethods: [...infoDraft.paymentMethods] });
    setActiveModal(null);
    setToastMessage("Info usaha berhasil diperbarui");
  }

  function handleProductImage(file?: File) {
    if (!file) return;
    readImageFile(
      file,
      (value) => {
        setProductDraft((current) => ({ ...current, image: value }));
        setProductError("");
      },
      setProductError,
    );
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = productDraft.name.trim();
    if (!productDraft.image || !cleanName) {
      setProductError("Foto dan nama produk wajib dilengkapi.");
      return;
    }

    if (productFormMode === "edit" && selectedProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === selectedProductId
            ? { ...product, name: cleanName, image: productDraft.image, imagePosition: "center" }
            : product,
        ),
      );
    } else {
      const nextProducts = [
        ...products,
        {
          id: `product-${Date.now()}`,
          name: cleanName,
          image: productDraft.image,
          imagePosition: "center",
        },
      ];
      setProducts(nextProducts);
      setCurrentPage(Math.ceil(nextProducts.length / PRODUCTS_PER_PAGE));
    }

    setActiveModal(null);
    setToastMessage("Produk berhasil diperbarui");
  }

  function deleteSelectedProduct() {
    if (!selectedProductId) return;
    const nextProducts = products.filter((product) => product.id !== selectedProductId);
    setProducts(nextProducts);
    setCurrentPage(Math.min(currentPage, Math.max(1, Math.ceil(nextProducts.length / PRODUCTS_PER_PAGE))));
    setSelectedProductId(null);
    setActiveModal(null);
    setToastMessage("Produk berhasil dihapus");
  }

  function openPublicProfile() {
    const profileSlug = createProfileSlug(info.name);
    const profileSnapshot = {
      slug: profileSlug,
      info,
      products,
      ownerName,
      verified: true,
      reputation: { rating: 4.8, reviewCount: 23, label: "Sangat dipercaya" },
      statistics: { profileViews: 142, contactCount: 18 },
    };

    try {
      sessionStorage.setItem(PUBLIC_PROFILE_PREVIEW_KEY, JSON.stringify(profileSnapshot));
    } catch {
      const storageSafeSnapshot = {
        ...profileSnapshot,
        info: {
          ...info,
          banner: info.banner.startsWith("data:") ? INITIAL_INFO.banner : info.banner,
          logo: info.logo.startsWith("data:") ? INITIAL_INFO.logo : info.logo,
        },
        products: products.map((product, index) => ({
          ...product,
          image: product.image.startsWith("data:")
            ? INITIAL_PRODUCTS[index % INITIAL_PRODUCTS.length]?.image ?? "/illustrations/storefront-wide.webp"
            : product.image,
        })),
      };

      try {
        sessionStorage.setItem(PUBLIC_PROFILE_PREVIEW_KEY, JSON.stringify(storageSafeSnapshot));
      } catch {
        // Route publik tetap memiliki data fallback apabila penyimpanan browser penuh.
      }
    }

    router.push(`/umkm/${profileSlug}`);
  }

  const displayedStart = products.length === 0 ? 0 : pageStart + 1;
  const displayedEnd = Math.min(pageStart + PRODUCTS_PER_PAGE, products.length);

  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <div className="mx-auto max-w-[1240px]">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#708078]">
          <span>Home</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#315b4c]">Profil Usaha</span>
        </nav>

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-worker-display)] text-[28px] font-semibold tracking-[-0.04em] text-[#0c261c] sm:text-[32px]">
              Kelola Profil Usaha
            </h2>
            <p className="mt-1 text-sm font-medium text-[#6b7b75]">
              Perbarui informasi usaha dan produk yang tampil di profil publik Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={openPublicProfile}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#16864c] bg-white px-4 text-sm font-extrabold text-[#086f3a] transition hover:bg-[#f0f8f3] sm:self-auto"
          >
            Lihat Profil Publik
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        <section id="profile-preview" className="overflow-hidden rounded-[20px] border border-[#dfe9e3] bg-white shadow-[0_10px_32px_rgba(12,38,28,.06)]">
          <div className="relative h-44 overflow-hidden sm:h-56">
            <PreviewImage src={info.banner} alt={`Banner ${info.name}`} objectPosition="50% 68%" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10231d]/65 via-transparent to-[#10231d]/15" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#10231d]/75 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
              <Eye className="h-4 w-4" />
              Preview Profil Publik
            </span>
          </div>
          <div className="relative px-5 pb-6 pt-[68px] sm:px-7 sm:pb-7 sm:pl-[190px] sm:pt-6">
            <div className="absolute -top-[58px] left-5 h-[116px] w-[116px] overflow-hidden rounded-full border-[5px] border-white bg-[#f4eee7] shadow-lg sm:left-8">
              <PreviewImage src={info.logo} alt={`Logo ${info.name}`} className="object-cover" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.035em] text-[#0c261c]">{info.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf7ee] px-2.5 py-1 text-[11px] font-extrabold text-[#07843f]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Terverifikasi
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#65766f]">
              <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />{info.category}</span>
              <span className="inline-flex items-center gap-1.5 text-[#8b6420]"><Star className="h-3.5 w-3.5 fill-[#f7bd38] text-[#f7bd38]" />4,8 <span className="text-[#65766f]">(23 ulasan)</span></span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Kecamatan Laweyan, Solo</span>
            </div>
          </div>
        </section>

        <PrivateProfileQrCard
          businessName={info.name}
          publicProfilePath={`/umkm/${createProfileSlug(info.name)}`}
          onNotify={setToastMessage}
        />

        <section className="mt-5 rounded-[20px] border border-[#d9e6de] bg-white p-5 shadow-[0_10px_30px_rgba(12,38,28,.055)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Info Usaha</h3>
            <button
              type="button"
              onClick={openInfoEditor}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#16864c] px-4 text-sm font-extrabold text-[#08783d] transition hover:bg-[#f0f8f3]"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          </div>
          <dl className="mt-5 grid gap-y-4 text-[13px] md:grid-cols-[118px_minmax(180px,1fr)_118px_minmax(180px,1fr)] md:gap-x-4 md:gap-y-3.5">
            <dt className="font-bold text-[#718078]">Nama Usaha</dt>
            <dd className="font-semibold text-[#16382b]">{info.name}</dd>
            <dt className="mt-1 font-bold text-[#718078] md:mt-0">Kategori</dt>
            <dd className="font-semibold text-[#16382b]">{info.category}</dd>

            <dt className="font-bold text-[#718078]">Deskripsi</dt>
            <dd className="min-w-0 font-medium leading-6 text-[#16382b]">{info.description}</dd>

            <dt className="font-bold text-[#718078] md:col-start-1">Tahun Berdiri</dt>
            <dd className="font-semibold text-[#16382b]">{info.foundedYear}</dd>
            <dt className="mt-1 font-bold text-[#718078] md:mt-0">Skala Usaha</dt>
            <dd className="font-semibold text-[#16382b]">{info.scale}</dd>

            <dt className="font-bold text-[#718078]">Jenis Usaha</dt>
            <dd className="font-semibold text-[#16382b]">{info.businessType}</dd>
            <dt className="mt-1 font-bold text-[#718078] md:mt-0">Metode Pembayaran</dt>
            <dd className="font-semibold leading-relaxed text-[#16382b]">{info.paymentMethods.join(", ") || "Belum diatur"}</dd>
          </dl>
        </section>

        <section className="mt-5 rounded-[20px] border border-[#dfe9e3] bg-white p-5 shadow-[0_8px_24px_rgba(12,38,28,.045)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Produk</h3>
              <p className="mt-1 text-xs font-medium text-[#718078]">Produk ini akan tampil sebagai preview di profil publik Anda.</p>
            </div>
            <button
              type="button"
              onClick={() => openProductForm("add")}
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#07843f] px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(7,132,63,.18)] transition hover:bg-[#066f36] sm:self-auto"
            >
              <ImagePlus className="h-4 w-4" /> Tambah Produk
            </button>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-[#dfe9e3] bg-[#fbfcfb] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(12,38,28,.1)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eaf0ec]">
                    <PreviewImage src={product.image} alt={product.name} objectPosition={product.imagePosition} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10231d]/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute right-2 top-2 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openProductForm("edit", product)}
                        aria-label={`Edit ${product.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-[#08783d] shadow-md transition hover:bg-[#eaf7ee]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirmation(product)}
                        aria-label={`Hapus ${product.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-[#b4233b] shadow-md transition hover:bg-[#fff0f2]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="min-h-[60px] px-4 py-3 text-sm font-extrabold leading-snug text-[#244b3c]">{product.name}</h4>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbdcd2] bg-[#f8fbf9] p-6 text-center">
              <ImagePlus className="h-9 w-9 text-[#74a28d]" />
              <p className="mt-3 text-sm font-extrabold text-[#244b3c]">Belum ada produk</p>
              <p className="mt-1 text-xs text-[#718078]">Tambahkan produk pertama untuk ditampilkan di profil publik.</p>
            </div>
          )}

          <footer className="mt-5 flex flex-col gap-3 border-t border-[#e4ece7] pt-4 text-xs font-semibold text-[#718078] sm:flex-row sm:items-center sm:justify-between">
            <span>Menampilkan {displayedStart}–{displayedEnd} dari {products.length} produk</span>
            {pageCount > 1 ? (
              <div className="flex items-center gap-2" aria-label="Navigasi halaman produk">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[#dce7e1] text-[#315b4c] transition hover:bg-[#f0f7f3] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-[#315b4c]">{currentPage} / {pageCount}</span>
                <button
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[#dce7e1] text-[#315b4c] transition hover:bg-[#f0f7f3] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </footer>
        </section>
      </div>

      {activeModal === "edit_info" ? (
        <ModalFrame title="Edit Info Usaha" titleId="edit-info-title" onClose={closeModal}>
          <form onSubmit={saveInfo} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
                <label>
                  <FieldLabel>Foto Banner</FieldLabel>
                  <div className="relative h-36 overflow-hidden rounded-2xl border border-[#dce7e1] bg-[#eef4f0]">
                    <PreviewImage src={infoDraft.banner} alt="Preview banner usaha" objectPosition="50% 68%" />
                    <div className="absolute inset-0 bg-[#10231d]/20" />
                    <button type="button" onClick={() => bannerInputRef.current?.click()} className="absolute bottom-3 right-3 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#08783d] shadow-md">
                      Ganti Banner
                    </button>
                  </div>
                  <span className="mt-1.5 block text-[10px] font-medium text-[#86958e]">Rasio 16:9 disarankan</span>
                  <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleInfoImage("banner", event.target.files?.[0])} />
                </label>
                <label>
                  <FieldLabel>Logo Usaha</FieldLabel>
                  <div className="flex h-36 items-center justify-center gap-4 rounded-2xl border border-[#dce7e1] bg-[#f8faf9] p-3">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#f4eee7] shadow-md">
                      <PreviewImage src={infoDraft.logo} alt="Preview logo usaha" />
                    </div>
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="rounded-xl border border-[#16864c] bg-white px-3 py-2 text-xs font-extrabold text-[#08783d]">
                      Ganti Logo
                    </button>
                  </div>
                  <span className="mt-1.5 block text-[10px] font-medium text-[#86958e]">Rasio 1:1 (akan tampil bulat)</span>
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleInfoImage("logo", event.target.files?.[0])} />
                </label>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <FieldLabel>Nama Usaha *</FieldLabel>
                  <input required value={infoDraft.name} onChange={(event) => setInfoDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass} />
                </label>
                <label>
                  <FieldLabel>Kategori *</FieldLabel>
                  <select required value={infoDraft.category} onChange={(event) => setInfoDraft((current) => ({ ...current, category: event.target.value }))} className={inputClass}>
                    <option>Batik / Tekstil</option><option>Kuliner</option><option>Kerajinan</option><option>Fashion</option><option>Jasa</option>
                  </select>
                </label>
                <label>
                  <FieldLabel>Skala Usaha</FieldLabel>
                  <select value={infoDraft.scale} onChange={(event) => setInfoDraft((current) => ({ ...current, scale: event.target.value }))} className={inputClass}>
                    <option>Mikro</option><option>Kecil</option><option>Menengah</option>
                  </select>
                </label>
                <label>
                  <FieldLabel>Jenis Usaha</FieldLabel>
                  <select value={infoDraft.businessType} onChange={(event) => setInfoDraft((current) => ({ ...current, businessType: event.target.value }))} className={inputClass}>
                    <option>Produksi</option><option>Perdagangan</option><option>Jasa</option><option>Produksi & Perdagangan</option>
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <FieldLabel>Deskripsi Usaha</FieldLabel>
                  <textarea
                    maxLength={300}
                    rows={4}
                    value={infoDraft.description}
                    onChange={(event) => setInfoDraft((current) => ({ ...current, description: event.target.value }))}
                    className="w-full resize-none rounded-xl border border-[#dce7e1] bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-[#17362a] outline-none transition focus:border-[#16864c] focus:ring-4 focus:ring-[#16864c]/10"
                  />
                  <span className="mt-1 block text-right text-[10px] font-semibold text-[#86958e]">{infoDraft.description.length}/300</span>
                </label>
                <div>
                  <FieldLabel>Metode Pembayaran</FieldLabel>
                  <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-[#dce7e1] px-2.5 py-2">
                    {infoDraft.paymentMethods.map((method) => (
                      <span key={method} className="inline-flex items-center gap-1 rounded-lg bg-[#edf5f0] px-2 py-1 text-[11px] font-bold text-[#315b4c]">
                        {method}
                        <button type="button" onClick={() => setInfoDraft((current) => ({ ...current, paymentMethods: current.paymentMethods.filter((item) => item !== method) }))} aria-label={`Hapus ${method}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <label className="relative ml-auto">
                      <span className="sr-only">Tambah metode pembayaran</span>
                      <select
                        value=""
                        onChange={(event) => {
                          const method = event.target.value;
                          if (method) setInfoDraft((current) => ({ ...current, paymentMethods: [...current.paymentMethods, method] }));
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      >
                        <option value="">Tambah metode</option>
                        {PAYMENT_OPTIONS.filter((method) => !infoDraft.paymentMethods.includes(method)).map((method) => <option key={method}>{method}</option>)}
                      </select>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#08783d]">Tambah <ChevronDown className="h-3 w-3" /></span>
                    </label>
                  </div>
                </div>
                <label>
                  <FieldLabel>Tahun Berdiri</FieldLabel>
                  <input type="number" min="1900" max="2100" value={infoDraft.foundedYear} onChange={(event) => setInfoDraft((current) => ({ ...current, foundedYear: event.target.value }))} className={inputClass} />
                </label>
                <label>
                  <FieldLabel>Nomor WhatsApp Usaha</FieldLabel>
                  <input type="tel" inputMode="tel" value={infoDraft.whatsappContact} onChange={(event) => setInfoDraft((current) => ({ ...current, whatsappContact: event.target.value }))} placeholder="Contoh: 6281234567890" className={inputClass} />
                </label>
              </div>
            </div>
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e4ece7] px-5 py-4 sm:px-6">
              <button type="button" onClick={closeModal} className="h-11 rounded-xl border border-[#cddbd3] px-5 text-sm font-extrabold text-[#315b4c] transition hover:bg-[#f4f8f5]">Batal</button>
              <button type="submit" className="h-11 rounded-xl bg-[#07843f] px-5 text-sm font-extrabold text-white transition hover:bg-[#066f36]">Simpan Perubahan</button>
            </footer>
          </form>
        </ModalFrame>
      ) : null}

      {activeModal === "product_form" ? (
        <ModalFrame title={productFormMode === "add" ? "Tambah Produk" : "Edit Produk"} titleId="product-form-title" onClose={closeModal} size="medium">
          <form onSubmit={saveProduct} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>Foto Produk *</FieldLabel>
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleProductImage(event.dataTransfer.files?.[0]);
                    }}
                    className="relative flex min-h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#b8cfc2] bg-[#f8fbf9] p-5 text-center transition hover:border-[#16864c] hover:bg-[#f1f8f4]"
                  >
                    {productDraft.image ? (
                      <>
                        <PreviewImage src={productDraft.image} alt="Preview foto produk" />
                        <span className="absolute bottom-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-extrabold text-[#08783d] shadow-md">Ganti foto</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-[#5e8e78]" />
                        <span className="mt-3 text-xs font-extrabold text-[#315b4c]">Klik atau drag & drop untuk upload foto</span>
                        <span className="mt-1 text-[10px] font-medium text-[#899890]">JPG, PNG, WEBP maks. 5MB</span>
                      </>
                    )}
                  </button>
                  <input ref={productInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleProductImage(event.target.files?.[0])} />
                </div>
                <label>
                  <FieldLabel>Nama Produk *</FieldLabel>
                  <input
                    value={productDraft.name}
                    onChange={(event) => {
                      setProductDraft((current) => ({ ...current, name: event.target.value }));
                      setProductError("");
                    }}
                    placeholder="Contoh: Batik Tulis Motif Parang"
                    className={inputClass}
                  />
                  <p className="mt-3 text-xs leading-relaxed text-[#718078]">Gunakan nama yang singkat dan mudah dikenali calon pelanggan.</p>
                </label>
              </div>
              {productError ? <p role="alert" className="mt-4 rounded-xl bg-[#fff0f2] px-3 py-2 text-xs font-bold text-[#b4233b]">{productError}</p> : null}
            </div>
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e4ece7] px-5 py-4 sm:px-6">
              <button type="button" onClick={closeModal} className="h-11 rounded-xl border border-[#cddbd3] px-5 text-sm font-extrabold text-[#315b4c] transition hover:bg-[#f4f8f5]">Batal</button>
              <button type="submit" className="h-11 rounded-xl bg-[#07843f] px-6 text-sm font-extrabold text-white transition hover:bg-[#066f36]">Simpan</button>
            </footer>
          </form>
        </ModalFrame>
      ) : null}

      {activeModal === "confirm_delete" ? (
        <ModalFrame title="Hapus produk ini?" titleId="confirm-delete-title" onClose={closeModal} size="small">
          <div className="px-5 py-5 sm:px-6">
            <p className="text-sm leading-relaxed text-[#66776f]">
              <strong className="font-extrabold text-[#29483d]">{selectedProduct?.name}</strong> yang dihapus tidak akan tampil lagi di profil publik Anda.
            </p>
          </div>
          <footer className="flex items-center justify-end gap-3 border-t border-[#e4ece7] px-5 py-4 sm:px-6">
            <button type="button" onClick={closeModal} className="h-11 rounded-xl border border-[#cddbd3] px-5 text-sm font-extrabold text-[#315b4c] transition hover:bg-[#f4f8f5]">Batal</button>
            <button type="button" onClick={deleteSelectedProduct} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#b4233b] px-5 text-sm font-extrabold text-white transition hover:bg-[#981c32]">
              <Trash2 className="h-4 w-4" /> Ya, Hapus
            </button>
          </footer>
        </ModalFrame>
      ) : null}

      {toastMessage ? (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-4 z-[110] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-[#b9ddc6] bg-[#eff9f1] px-4 py-3 text-sm font-extrabold text-[#176b39] shadow-[0_16px_40px_rgba(12,38,28,.18)] sm:right-6 sm:min-w-80">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} aria-label="Tutup notifikasi" className="grid h-7 w-7 place-items-center rounded-lg hover:bg-[#dcefe1]">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </UmkmDashboardShell>
  );
}
