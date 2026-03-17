"use client";

import { useMemo } from "react";
import { useGetWebpageContentsQuery } from "@/lib/features/blog/blogApi";

const DEFAULT_LOGO_SRC = "/logo.webp";
const DEFAULT_FAVICON_SRC = "/logo.webp";

const normalizeLogoUrl = (urlValue: string | null | undefined) => {
    if (!urlValue) return "";
    if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
    return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
};

export function useBrandingAssets() {
    const { data, isLoading, isFetching, isError } = useGetWebpageContentsQuery({
        ordering: "-created_at",
    });

    const latestAssets = useMemo(() => {
        const results = data?.results ?? [];
        const latestLogoItem = results.find((item) => item.type === "logo");
        const latestHeroTitleItem = results.find((item) => item.type === "hero_title");
        const latestHeroImagesItem = results.find(
            (item) => item.type === "hero_images" || item.type === "hero_images_type"
        );

        return {
            latestLogoItem,
            latestHeroTitleItem,
            latestHeroImagesItem,
        };
    }, [data?.results]);

    const latestLogoSrc = useMemo(() => {
        const logoCandidate =
            latestAssets.latestLogoItem?.logo_url ||
            latestAssets.latestLogoItem?.logo ||
            latestAssets.latestLogoItem?.image_url ||
            "";
        return normalizeLogoUrl(logoCandidate);
    }, [latestAssets.latestLogoItem]);

    const heroImages = useMemo(
        () => latestAssets.latestHeroImagesItem?.hero_images ?? [],
        [latestAssets.latestHeroImagesItem]
    );

    const heroTitles = useMemo(
        () => ({
            first:
                latestAssets.latestHeroTitleItem?.hero_title_first ||
                latestAssets.latestHeroTitleItem?.hero_title_1 ||
                "",
            second:
                latestAssets.latestHeroTitleItem?.hero_title_second ||
                latestAssets.latestHeroTitleItem?.hero_title_2 ||
                "",
            third:
                latestAssets.latestHeroTitleItem?.hero_title_third ||
                latestAssets.latestHeroTitleItem?.hero_title_3 ||
                "",
        }),
        [latestAssets.latestHeroTitleItem]
    );

    const logoSrc = latestLogoSrc || DEFAULT_LOGO_SRC;
    const faviconSrc = latestLogoSrc || DEFAULT_FAVICON_SRC;

    return {
        logoSrc,
        faviconSrc,
        heroTitles,
        heroImages,
        isLoading: isLoading || isFetching,
        isError,
    };
}
