"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MonitorPlay,
  Users,
  PlaneTakeoff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBrandingAssets } from "@/hooks/useBrandingAssets";

const brandBlueColor = "#1A3EB1";

const prevArrowProps = {
  "aria-label": "Önceki slayt",
  className:
    "absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white focus:outline-none",
} as const;

const nextArrowProps = {
  "aria-label": "Sonraki slayt",
  className:
    "absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white focus:outline-none",
} as const;

const FALLBACK_TITLES = {
  first: "Almanca",
  second: "Alman Akademisi'nde",
  third: "öğrenilir.",
};

export function HeroSection() {
  const { heroTitles, heroImages } = useBrandingAssets();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    const normalizedImages = (heroImages || [])
      .map((image) => {
        const rawUrl = image?.image_url || "";
        if (!rawUrl) return "";
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
          return rawUrl;
        return `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}`;
      })
      .filter(Boolean);

    if (normalizedImages.length > 0) {
      return normalizedImages;
    }

    return ["/hero.jpg"];
  }, [heroImages]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const intervalId = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % slides.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const displayTitle = {
    first: heroTitles.first?.trim() || FALLBACK_TITLES.first,
    second: heroTitles.second?.trim() || FALLBACK_TITLES.second,
    third: heroTitles.third?.trim() || FALLBACK_TITLES.third,
  };

  const serviceItems = [
    {
      label: "Online",
      icon: MonitorPlay,
    },
    {
      label: "Yüz yüze",
      icon: Users,
    },
    {
      label: "Almanya Danışmanlık",
      icon: PlaneTakeoff,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:py-24 lg:py-32">
      <div className="container mx-auto grid gap-12 lg:grid-cols-2 lg:gap-8 items-center px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {serviceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="inline-flex w-fit items-center justify-start gap-2 rounded-xl border border-[#1A3EB1]/15 bg-[#1A3EB1]/5 px-4 py-2 text-sm font-medium text-[#1A3EB1] cursor-default select-none"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <h1 className="text-4xl tracking-tight sm:text-5xl xl:text-6xl/none text-primary leading-tight">
              <span className="block font-bold">{displayTitle.first}</span>
              <span className="block font-medium">{displayTitle.second}</span>
              <span className="block font-bold">{displayTitle.third}</span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-lg">
              Alman Akademisi'nde dijital Almanca kursuna kayıt olabilir,
              dijital eserler ile Almanca seviyenizi geliştirebilir, WhatsApp
              kulübüne katılarak Almancayı hayatınızın bir parçası
              yapabilirsiniz.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/bilgi-al">Sizi Arayalım</Link>
            </Button>

            <Button
              size="lg"
              className="h-12 px-8 text-white bg-[#25D366] hover:bg-[#20bd5a] border-none"
              style={{ backgroundColor: "#25D366" }}
              asChild
            >
              <Link href="https://wa.me/905393688669" target="_blank">
                WhatsApp’tan Yazın
              </Link>
            </Button>

            <Button
              size="lg"
              className="h-12 px-8 text-white bg-black hover:bg-zinc-800 border-none"
              asChild
            >
              <Link href="tel:08508408303">Bizi Arayın</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center relative">
          <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-[24px] border-4 border-white shadow-lg">
            <AnimatePresence mode="wait">
              <motion.img
                key={slides[activeIndex]}
                src={slides[activeIndex]}
                alt="Alman Akademisi Hero"
                className="h-full w-full object-cover"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  {...prevArrowProps}
                  onClick={() =>
                    setActiveIndex(
                      (prev) => (prev - 1 + slides.length) % slides.length,
                    )
                  }
                >
                  <ChevronLeft
                    className="h-5 w-5"
                    style={{ color: brandBlueColor }}
                    strokeWidth={2.5}
                  />
                </button>

                <button
                  type="button"
                  {...nextArrowProps}
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % slides.length)
                  }
                >
                  <ChevronRight
                    className="h-5 w-5"
                    style={{ color: brandBlueColor }}
                    strokeWidth={2.5}
                  />
                </button>

                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-2.5 py-1 backdrop-blur-sm">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === activeIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
