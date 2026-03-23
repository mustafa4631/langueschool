"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetCourseGalleryListQuery } from "@/lib/features/blog/blogApi";

const COURSE_FEATURE_IMAGES = [
    "/k1.webp",
    "/k2.webp",
    "/k3.webp",
    "/k4.webp",
    "/k5.webp",
    "/k6.webp",
    "/k7.webp",
    "/k8.webp",
    "/k9.webp",
];

type CourseFeaturesSliderProps = {
    fallbackImages?: string[];
};

export function CourseFeaturesSlider({ fallbackImages }: CourseFeaturesSliderProps = {}) {
    const [api, setApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { data: galleryData, isLoading: isGalleryLoading, isFetching: isGalleryFetching, isError: isGalleryError } =
        useGetCourseGalleryListQuery({ ordering: "-created_at" });

    const normalizeImageUrl = (urlValue: string | null | undefined) => {
        if (!urlValue) return "";
        if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
        return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
    };

    const apiGalleryImages = (galleryData?.results ?? [])
        .slice()
        .sort((a, b) => {
            const left = new Date(a.created_at || "").getTime();
            const right = new Date(b.created_at || "").getTime();
            if (Number.isNaN(left) || Number.isNaN(right)) return 0;
            return right - left;
        })
        .map((item) => normalizeImageUrl(item.image_url))
        .filter(Boolean);

    const isUsingApiImages = !isGalleryError && apiGalleryImages.length > 0;
    const fallbackFeatureGallery = fallbackImages && fallbackImages.length > 0 ? fallbackImages : COURSE_FEATURE_IMAGES;
    const galleryImages = isUsingApiImages ? apiGalleryImages : fallbackFeatureGallery;
    const currentImagesCount = galleryImages.length;
    const hasMultipleImages = currentImagesCount > 1;
    const carouselKey = `${isUsingApiImages ? "api" : "default"}-${currentImagesCount}`;

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            const rawIndex = api.selectedScrollSnap();
            const normalizedIndex = currentImagesCount > 0 ? rawIndex % currentImagesCount : 0;
            setSelectedIndex(normalizedIndex);
        };

        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api, currentImagesCount]);

    useEffect(() => {
        if (selectedIndex >= currentImagesCount) {
            setSelectedIndex(0);
        }
    }, [selectedIndex, currentImagesCount]);

    useEffect(() => {
        if (!api || !hasMultipleImages) return;
        const timer = setInterval(() => {
            api.scrollNext();
        }, 4000);
        return () => clearInterval(timer);
    }, [api, hasMultipleImages]);

    return (
        <section className="mt-20 w-full">
            <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold text-[#1a365d] md:text-4xl">
                    Kayıt Olacağınız Kursun Özellikleri
                </h2>
            </div>

            <Carousel
                key={carouselKey}
                setApi={setApi}
                opts={{ loop: hasMultipleImages, align: "center" }}
                className="mx-auto w-full max-w-6xl"
            >
                <CarouselContent className="items-center">
                    {galleryImages.map((src, index) => (
                        <CarouselItem key={src} className="basis-full md:basis-1/2 lg:basis-1/3">
                            <div
                                className={`mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-xl backdrop-blur-sm transition-all duration-500 ${selectedIndex === index ? "scale-110" : "scale-95 opacity-75"}`}
                            >
                                <div className="relative aspect-3/4">
                                    <Image
                                        src={src}
                                        alt={`Kurs özelliği ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover"
                                        priority={index < 2}
                                    />
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {hasMultipleImages && (
                    <>
                        <CarouselPrevious className="left-2 h-11 w-11 border-slate-200 bg-white/80 text-[#1a365d] shadow-md backdrop-blur-md hover:bg-white" />
                        <CarouselNext className="right-2 h-11 w-11 border-slate-200 bg-white/80 text-[#1a365d] shadow-md backdrop-blur-md hover:bg-white" />
                    </>
                )}
            </Carousel>

            {(isGalleryLoading || isGalleryFetching) && (
                <p className="mt-4 text-center text-xs text-slate-400">Galeri görselleri yükleniyor...</p>
            )}

            {hasMultipleImages && (
                <div className="mt-10 flex items-center justify-center gap-2">
                    {Array.from({ length: currentImagesCount }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`Slayt ${index + 1}`}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2.5 rounded-full transition-all ${selectedIndex === index ? "w-6 bg-[#1a365d]" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
