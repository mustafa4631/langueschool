"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { BrandingFaviconSync } from "@/components/BrandingFaviconSync";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";
import { useBrandingAssets } from "@/hooks/useBrandingAssets";

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? "";
    const isAdminPanel = pathname.startsWith("/dashboard");
    const showNavigation = !isAdminPanel;
    const { logoSrc, faviconSrc } = useBrandingAssets();

    return (
        <>
            <BrandingFaviconSync faviconSrc={faviconSrc} />
            {showNavigation && <Header logoSrc={logoSrc} />}
            {children}
            {showNavigation && <Footer logoSrc={logoSrc} />}
            <FloatingContactButtons />
        </>
    );
}
