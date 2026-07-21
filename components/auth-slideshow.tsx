"use client";

import Image, { type StaticImageData } from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
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

export function AuthSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousIndex = useRef(0);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, paused]);

  useLayoutEffect(() => {
    const elements = slideRefs.current.filter(
      (element): element is HTMLDivElement => Boolean(element),
    );
    const current = elements[activeIndex];
    const previous = elements[previousIndex.current];
    if (!current) return;

    gsap.killTweensOf(elements);

    if (previousIndex.current === activeIndex) {
      gsap.set(elements, { autoAlpha: 0, scale: 1 });
      gsap.set(current, { autoAlpha: 1, zIndex: 1 });
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(elements, { autoAlpha: 0, scale: 1, zIndex: 0 });
      gsap.set(current, { autoAlpha: 1, zIndex: 1 });
      previousIndex.current = activeIndex;
      return;
    }

    gsap.set(current, { autoAlpha: 0, scale: 1.025, y: 10, zIndex: 2 });
    if (previous) gsap.set(previous, { zIndex: 1 });

    const timeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    if (previous) {
      timeline.to(previous, { autoAlpha: 0, scale: 1.015, duration: 0.7 }, 0);
    }
    timeline
      .to(current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.82 }, 0)
      .set(current, { zIndex: 1 })
      .set(previous ?? [], { scale: 1, zIndex: 0 });

    previousIndex.current = activeIndex;
    return () => {
      timeline.kill();
    };
  }, [activeIndex]);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#f8f7ef]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Manfaat Pull untuk UMKM dan pekerja"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.label}
          ref={(element) => {
            slideRefs.current[index] = element;
          }}
          className={`absolute inset-0 ${index === 0 ? "opacity-100" : "invisible opacity-0"}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} dari ${slides.length}: ${slide.label}`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-2.5 py-2 shadow-lg shadow-emerald-950/10 backdrop-blur-md">
        {slides.map((slide, index) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
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
