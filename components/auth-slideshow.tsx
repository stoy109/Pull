"use client";

import { getImageProps, type StaticImageData } from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import belanjaBareng from "@/public/auth/slides/01-belanja-bareng.webp";
import tenagaLokal from "@/public/auth/slides/02-tenaga-lokal.webp";
import dariLapakKeLayar from "@/public/auth/slides/03-dari-lapak-ke-layar.webp";
import reputasiTerjaga from "@/public/auth/slides/04-reputasi-terjaga.webp";

type Slide = {
  image: StaticImageData;
  alt: string;
  label: string;
};

const slides: Slide[] = [
  {
    image: belanjaBareng,
    alt: "Belanja bersama agar harga bahan baku lebih ringan",
    label: "Belanja Bareng",
  },
  {
    image: tenagaLokal,
    alt: "Temukan tenaga lokal agar usaha lebih gesit",
    label: "Tenaga Lokal",
  },
  {
    image: dariLapakKeLayar,
    alt: "Bawa usaha dari lapak masuk ke layar",
    label: "Dari Lapak ke Layar",
  },
  {
    image: reputasiTerjaga,
    alt: "Transaksi nyata membangun reputasi yang terjaga",
    label: "Reputasi Terjaga",
  },
];

const desktopMedia = "(min-width: 1024px)";
const emptyImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

const slideSources = slides.map(({ image, alt }) =>
  getImageProps({ src: image, alt, sizes: "(min-width: 68rem) 32rem, 50vw" }).props,
);

function showSlide(shownSlides: number[], index: number) {
  return shownSlides[0] === index
    ? shownSlides
    : [index, ...shownSlides.filter((shownIndex) => shownIndex !== index)];
}

export function AuthSlideshow() {
  const [shownSlides, setShownSlides] = useState([0]);
  const [paused, setPaused] = useState(false);
  const activeIndex = shownSlides[0];

  useEffect(() => {
    if (paused) return;

    const media = window.matchMedia(`${desktopMedia} and (prefers-reduced-motion: no-preference)`);
    let timeout: number | undefined;

    function scheduleNextSlide() {
      window.clearTimeout(timeout);
      if (media.matches) {
        timeout = window.setTimeout(() => {
          setShownSlides((current) => showSlide(current, (activeIndex + 1) % slides.length));
        }, 5500);
      }
    }

    scheduleNextSlide();
    media.addEventListener("change", scheduleNextSlide);
    return () => {
      window.clearTimeout(timeout);
      media.removeEventListener("change", scheduleNextSlide);
    };
  }, [activeIndex, paused]);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#f8f7ef]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Manfaat Pull untuk UMKM dan pekerja"
    >
      {slides.map((slide, index) => {
        const active = index === activeIndex;
        const { srcSet, sizes } = slideSources[index];

        return (
          <div
            key={slide.label}
            className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${active ? "z-[1] opacity-100" : "pointer-events-none opacity-0"}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} dari ${slides.length}: ${slide.label}`}
            aria-hidden={!active}
          >
            {shownSlides.includes(index) ? (
              <picture>
                <source media={desktopMedia} srcSet={srcSet} sizes={sizes} />
                <img
                  src={emptyImage}
                  alt={slide.alt}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : undefined}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>
            ) : null}
          </div>
        );
      })}

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-2.5 py-2 shadow-lg shadow-emerald-950/10 backdrop-blur-md">
        {slides.map((slide, index) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => setShownSlides((current) => showSlide(current, index))}
            className={`h-2 rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-300 ${
              activeIndex === index ? "w-6 bg-[#145c46]" : "w-2 bg-[#b8cec2] hover:bg-[#6d9c82]"
            }`}
            aria-label={`Tampilkan ${slide.label}`}
            aria-current={activeIndex === index ? "true" : undefined}
          />
        ))}
        <span className="mx-0.5 h-4 w-px bg-[#d7e4dc]" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          className="grid h-7 w-7 place-items-center rounded-full text-[#145c46] transition-colors hover:bg-[#eaf4ee]"
          aria-label={paused ? "Putar slideshow" : "Jeda slideshow"}
        >
          {paused ? <Play className="h-3.5 w-3.5" fill="currentColor" /> : <Pause className="h-3.5 w-3.5" fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}
