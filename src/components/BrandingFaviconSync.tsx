"use client";

import { useEffect } from "react";

type BrandingFaviconSyncProps = {
    faviconSrc: string;
};

export function BrandingFaviconSync({ faviconSrc }: BrandingFaviconSyncProps) {
    useEffect(() => {
        if (typeof document === "undefined") return;

        const source = faviconSrc || "/logo.webp";
        const withVersion = `${source}${source.includes("?") ? "&" : "?"}v=${Date.now()}`;

        const updateOrCreate = (rel: "icon" | "shortcut icon" | "apple-touch-icon") => {
            const selector = `link[rel='${rel}']`;
            const existing = document.head.querySelector<HTMLLinkElement>(selector);
            if (existing) {
                existing.href = withVersion;
                return;
            }

            const link = document.createElement("link");
            link.rel = rel;
            link.href = withVersion;
            document.head.appendChild(link);
        };

        const allIconLinks = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']"));
        allIconLinks.forEach((link) => {
            link.href = withVersion;
        });

        updateOrCreate("icon");
        updateOrCreate("shortcut icon");
        updateOrCreate("apple-touch-icon");
    }, [faviconSrc]);

    return null;
}
