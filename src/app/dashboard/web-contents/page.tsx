"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetWebpageContentsQuery, type WebpageContentItem } from "@/lib/features/blog/blogApi";

const typeLabelMap: Record<string, string> = {
    hero_title: "Başlık",
    logo: "Logo",
    hero_images: "Hero Resimler",
    hero_images_type: "Hero Resimler",
};

const typeBadgeClassMap: Record<string, string> = {
    hero_title: "bg-indigo-50 text-indigo-700 border-indigo-200",
    logo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hero_images: "bg-orange-50 text-orange-700 border-orange-200",
    hero_images_type: "bg-orange-50 text-orange-700 border-orange-200",
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const normalizeImageUrl = (urlValue: string | null | undefined) => {
    if (!urlValue) return "";
    if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
    return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
};

const getLogoPreviewUrl = (item: WebpageContentItem) => {
    const candidate = item.logo_url || item.logo || item.image_url || "";
    return normalizeImageUrl(candidate);
};

const getHeroTitlePreview = (item: WebpageContentItem) => {
    const titleParts = [
        item.hero_title_1,
        item.hero_title_2,
        item.hero_title_3,
        item.title_1,
        item.title_2,
        item.title_3,
        item.hero_title,
        item.title,
    ]
        .map((part) => (part || "").trim())
        .filter((part) => part.length > 0);

    const uniqueParts = Array.from(new Set(titleParts));
    return uniqueParts.length > 0 ? uniqueParts.join(" • ") : "-";
};

const getHeroImagePreviewUrl = (item: WebpageContentItem) => {
    const firstImage = item.hero_images?.[0];
    if (!firstImage?.image_url) return "";
    return normalizeImageUrl(firstImage.image_url);
};

export default function WebContentsPage() {
    const router = useRouter();
    const { isAuthorized, profile, isLoading: isAuthLoading } = useAuthGuard("admin");
    const [ordering, setOrdering] = useState("-created_at");
    const [contentType, setContentType] = useState("");

    const queryParams = useMemo(
        () => ({
            ordering,
            type: contentType || undefined,
        }),
        [ordering, contentType]
    );

    const {
        data: webContentResponse,
        isLoading: isWebContentsLoading,
        isFetching: isWebContentsFetching,
    } = useGetWebpageContentsQuery(queryParams, { skip: !isAuthorized });

    const webContents = webContentResponse?.results ?? [];
    const isBusy = isWebContentsLoading || isWebContentsFetching;

    if (isAuthLoading || (!isAuthorized && typeof window !== "undefined")) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar
                firstName={profile?.first_name || ""}
                lastName={profile?.last_name || ""}
                username={profile?.username || ""}
            />

            <main className="flex-1 lg:ml-72 min-w-0 pb-24">
                <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-8">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Web İçerikleri</h1>
                        <Button
                            asChild
                            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm flex items-center gap-2 px-6 h-11 rounded-lg font-medium transition-all hover:brightness-110"
                        >
                            <Link href="/dashboard/web-contents/create">
                                <Plus className="h-5 w-5" />
                                Yeni İçerik Ekle
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <label className="flex w-full flex-col gap-1.5 sm:w-auto">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tarih Sıralaması</span>
                            <select
                                className="h-10 min-w-[190px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
                                value={ordering}
                                onChange={(event) => setOrdering(event.target.value)}
                            >
                                <option value="-created_at">Yeniden Eskiye</option>
                                <option value="created_at">Eskiden Yeniye</option>
                            </select>
                        </label>

                        <label className="flex w-full flex-col gap-1.5 sm:w-auto">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tür Filtresi</span>
                            <select
                                className="h-10 min-w-[190px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
                                value={contentType}
                                onChange={(event) => setContentType(event.target.value)}
                            >
                                <option value="">Tümü</option>
                                <option value="hero_title">Başlık</option>
                                <option value="logo">Logo</option>
                                <option value="hero_images">Hero Resimler</option>
                            </select>
                        </label>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto relative min-h-[300px]">
                            {isBusy && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
                                </div>
                            )}

                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-slate-100 bg-slate-50/50">
                                        <TableHead className="w-[60%] py-4 px-4 lg:px-6 text-xs font-semibold tracking-wider uppercase text-slate-500">İÇERİK ÖNİZLEME</TableHead>
                                        <TableHead className="w-[16%] py-4 px-4 lg:px-6 text-xs font-semibold tracking-wider uppercase text-slate-500">TÜR</TableHead>
                                        <TableHead className="w-[24%] py-4 px-4 lg:px-6 text-xs font-semibold tracking-wider uppercase text-slate-500">TARİH</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isWebContentsLoading ? (
                                        Array.from({ length: 6 }).map((_, index) => (
                                            <TableRow key={index} className="animate-pulse">
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="h-12 w-56 rounded bg-slate-200" />
                                                </TableCell>
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                                                </TableCell>
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="h-4 w-32 rounded bg-slate-200" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : webContents.length > 0 ? (
                                        webContents.map((item) => {
                                            const isLogoType = item.type === "logo";
                                            const isHeroImagesType = item.type === "hero_images" || item.type === "hero_images_type";
                                            const typeLabel = typeLabelMap[item.type] || item.type;
                                            const badgeClass = typeBadgeClassMap[item.type] || "bg-slate-100 text-slate-700 border-slate-200";
                                            const logoPreviewUrl = getLogoPreviewUrl(item);
                                            const heroTitlePreview = getHeroTitlePreview(item);
                                            const heroImagePreviewUrl = getHeroImagePreviewUrl(item);

                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                                                    onClick={() => router.push(`/dashboard/web-contents/${item.id}`)}
                                                >
                                                    <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                        {isLogoType ? (
                                                            logoPreviewUrl ? (
                                                                <div className="relative h-14 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                                    <Image
                                                                        src={logoPreviewUrl}
                                                                        alt="Logo önizleme"
                                                                        fill
                                                                        className="object-contain p-2"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-slate-400">Logo bulunamadı</span>
                                                            )
                                                        ) : isHeroImagesType ? (
                                                            heroImagePreviewUrl ? (
                                                                <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                                    <Image
                                                                        src={heroImagePreviewUrl}
                                                                        alt="Hero görsel önizleme"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                                    Çoklu Resim
                                                                </span>
                                                            )
                                                        ) : (
                                                            <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                                                                {heroTitlePreview}
                                                            </p>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                        <Badge variant="secondary" className={`font-medium px-2.5 py-0.5 border ${badgeClass}`}>
                                                            {typeLabel}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {formatDateTime(item.created_at)}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-48 text-center text-slate-500">
                                                {!isBusy && "Web içeriği kaydı bulunamadı."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
