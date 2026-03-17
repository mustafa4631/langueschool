"use client";

import { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetWebContentDetailQuery, type WebpageContentDetailResponse } from "@/lib/features/blog/blogApi";

const normalizeImageUrl = (urlValue: string | null | undefined) => {
    if (!urlValue) return "";
    if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
    return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
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

const typeLabelMap: Record<string, string> = {
    hero_title: "Başlık",
    logo: "Logo",
    hero_images: "Hero Resimler",
    hero_images_type: "Hero Resimler",
};

const getDetailData = (response: WebpageContentDetailResponse | undefined) => {
    if (!response) return null;
    if ("data" in response) return response.data;
    return response;
};

export default function WebContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const itemId = Number(id);
    const router = useRouter();
    const { isAuthorized, profile, isLoading: isAuthLoading } = useAuthGuard("admin");

    const {
        data: detailResponse,
        isLoading: isDetailLoading,
        isFetching: isDetailFetching,
        isError: isDetailError,
    } = useGetWebContentDetailQuery(itemId, {
        skip: !isAuthorized || Number.isNaN(itemId) || itemId <= 0,
    });

    const detailData = getDetailData(detailResponse);
    const isHeroTitleType = detailData?.type === "hero_title";
    const isLogoType = detailData?.type === "logo";
    const isHeroImagesType = detailData?.type === "hero_images" || detailData?.type === "hero_images_type";

    const logoUrl = normalizeImageUrl(detailData?.logo_url || detailData?.logo || detailData?.image_url || "");
    const heroImages = (detailData?.hero_images || []).map((image, index) => ({
        ...image,
        order: image.order || index + 1,
        image_url: normalizeImageUrl(image.image_url),
    }));

    if (isAuthLoading || isDetailLoading || isDetailFetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
            </div>
        );
    }

    if (isDetailError || !detailData) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar
                    firstName={profile?.first_name || ""}
                    lastName={profile?.last_name || ""}
                    username={profile?.username || ""}
                />
                <main className="flex-1 lg:ml-72 min-w-0 pb-24 p-4 sm:p-8">
                    <div className="mx-auto max-w-[1200px] rounded-2xl border border-slate-200 bg-white p-8 text-center">
                        <p className="text-slate-700 font-semibold">İçerik detayı yüklenemedi.</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push("/dashboard/web-contents")}
                        >
                            Listeye Dön
                        </Button>
                    </div>
                </main>
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
                <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Web İçerik Detayı</h1>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                                    {typeLabelMap[detailData.type] || detailData.type}
                                </Badge>
                                <span className="text-sm text-slate-500">
                                    {formatDateTime(detailData.created_at)}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="border-slate-200 text-slate-700"
                            onClick={() => router.push("/dashboard/web-contents")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Geri Dön
                        </Button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
                        {isHeroTitleType && (
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Başlık 1. Satır</p>
                                    <p className="mt-2 text-base font-semibold text-slate-800">
                                        {detailData.hero_title_first || detailData.hero_title_1 || "-"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Başlık 2. Satır</p>
                                    <p className="mt-2 text-base font-semibold text-slate-800">
                                        {detailData.hero_title_second || detailData.hero_title_2 || "-"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Başlık 3. Satır</p>
                                    <p className="mt-2 text-base font-semibold text-slate-800">
                                        {detailData.hero_title_third || detailData.hero_title_3 || "-"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {isLogoType && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                {logoUrl ? (
                                    <div className="relative mx-auto h-52 w-full max-w-xl rounded-xl border border-slate-200 bg-white">
                                        <Image
                                            src={logoUrl}
                                            alt="Logo önizleme"
                                            fill
                                            className="object-contain p-4"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Logo görseli bulunamadı.</p>
                                )}
                            </div>
                        )}

                        {isHeroImagesType && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {heroImages.length > 0 ? (
                                    heroImages.map((image) => (
                                        <div key={`${image.image_public_id || image.order}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <div className="relative h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                <Image
                                                    src={image.image_url}
                                                    alt={`Hero görsel ${image.order}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-slate-700">Sıra: {image.order}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Hero görseli bulunamadı.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
