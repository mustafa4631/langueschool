"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Loader2, UploadCloud, X } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWebContentMutation, useUploadImageMutation } from "@/lib/features/blog/blogApi";

const webContentSchema = z
    .object({
        content_type: z.enum(["logo", "hero_title", "hero_images_type"]),
        logo_url: z.string().default(""),
        logo_public_id: z.string().default(""),
        hero_title_first: z.string().default(""),
        hero_title_second: z.string().default(""),
        hero_title_third: z.string().default(""),
        hero_images: z
            .array(
                z.object({
                    image_url: z.string(),
                    image_public_id: z.string(),
                    order: z.number().int().positive(),
                })
            )
            .default([]),
    })
    .superRefine((values, context) => {
        if (values.content_type === "logo") {
            if (!values.logo_url.trim()) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["logo_url"],
                    message: "Logo görseli yüklemek zorunludur.",
                });
            }
            if (!values.logo_public_id.trim()) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["logo_public_id"],
                    message: "Logo public_id bilgisi zorunludur.",
                });
            }
        }

        if (values.content_type === "hero_title") {
            if (!values.hero_title_first.trim()) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["hero_title_first"],
                    message: "Başlık 1. satır zorunludur.",
                });
            }
            if (!values.hero_title_second.trim()) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["hero_title_second"],
                    message: "Başlık 2. satır zorunludur.",
                });
            }
            if (!values.hero_title_third.trim()) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["hero_title_third"],
                    message: "Başlık 3. satır zorunludur.",
                });
            }
        }

        if (values.content_type === "hero_images_type" && values.hero_images.length === 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["hero_images"],
                message: "Hero görseller için en az bir görsel yüklemelisiniz.",
            });
        }
    });

type WebContentFormInput = z.input<typeof webContentSchema>;
type WebContentFormValues = z.output<typeof webContentSchema>;

type ErrorPayload = {
    status?: string | number;
    originalStatus?: number;
    data?: string | { status?: number; message?: string; detail?: string; data?: { message?: string } };
};

const extractErrorMessage = (payload: ErrorPayload["data"]) => {
    if (!payload) return "";
    if (typeof payload === "string") return payload;
    return payload.detail || payload.message || payload.data?.message || "";
};

const extractCreatedResponse = (payload: ErrorPayload["data"]) => {
    if (!payload) return null;

    if (typeof payload === "object") {
        const statusCode = Number(payload.status);
        if ([200, 201].includes(statusCode)) {
            return {
                status: statusCode,
                message: payload.message || payload.data?.message || "İçerik başarıyla oluşturuldu.",
            };
        }
        return null;
    }

    if (typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload) as { status?: number; message?: string };
            const statusCode = Number(parsed.status);
            if ([200, 201].includes(statusCode)) {
                return {
                    status: statusCode,
                    message: parsed.message || "İçerik başarıyla oluşturuldu.",
                };
            }
        } catch {
            return null;
        }
    }

    return null;
};

export default function CreateWebContentPage() {
    const router = useRouter();
    const { isAuthorized, profile, isLoading: isAuthLoading } = useAuthGuard("admin");

    const [createWebContent, { isLoading: isSubmitting }] = useCreateWebContentMutation();
    const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
    const [heroImages, setHeroImages] = useState<
        Array<{ image_url: string; image_public_id: string; order: number }>
    >([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<WebContentFormInput, unknown, WebContentFormValues>({
        resolver: zodResolver(webContentSchema),
        defaultValues: {
            content_type: "logo",
            logo_url: "",
            logo_public_id: "",
            hero_title_first: "",
            hero_title_second: "",
            hero_title_third: "",
            hero_images: [],
        },
    });

    const selectedType = watch("content_type");
    const logoUrl = watch("logo_url");

    const normalizedHeroImages = useMemo(
        () =>
            heroImages.map((image, index) => ({
                ...image,
                order: index + 1,
            })),
        [heroImages]
    );

    const isFormBusy = useMemo(() => isSubmitting || isUploadingImage, [isSubmitting, isUploadingImage]);

    const handleRemoveLogo = () => {
        setValue("logo_url", "", { shouldValidate: true });
        setValue("logo_public_id", "", { shouldValidate: true });
    };

    const handleRemoveHeroImage = (publicId: string) => {
        const nextImages = heroImages
            .filter((image) => image.image_public_id !== publicId)
            .map((image, index) => ({ ...image, order: index + 1 }));
        setHeroImages(nextImages);
        setValue("hero_images", nextImages, { shouldValidate: true });
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Görsel boyutu maksimum 5MB olmalıdır.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadResponse = await uploadImage(formData).unwrap();
            const firstResult = uploadResponse?.results?.[0];

            if (!firstResult?.url || !firstResult?.public_id) {
                throw new Error("Yükleme yanıtı geçersiz.");
            }

            setValue("logo_url", firstResult.url, { shouldValidate: true });
            setValue("logo_public_id", firstResult.public_id, { shouldValidate: true });
            toast.success("Logo başarıyla yüklendi.");
        } catch {
            toast.error("Logo yüklenirken bir hata oluştu.");
        } finally {
            event.target.value = "";
        }
    };

    const handleHeroImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);
        const uploadedEntries: Array<{ image_url: string; image_public_id: string; order: number }> = [];

        for (const file of selectedFiles) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name}: Görsel boyutu maksimum 5MB olmalıdır.`);
                continue;
            }

            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadResponse = await uploadImage(formData).unwrap();
                const firstResult = uploadResponse?.results?.[0];

                if (!firstResult?.url || !firstResult?.public_id) {
                    throw new Error("Yükleme yanıtı geçersiz.");
                }

                uploadedEntries.push({
                    image_url: firstResult.url,
                    image_public_id: firstResult.public_id,
                    order: 1,
                });
            } catch {
                toast.error(`${file.name}: Görsel yüklenirken bir hata oluştu.`);
            }
        }

        if (uploadedEntries.length > 0) {
            const nextImages = [...heroImages, ...uploadedEntries].map((image, index) => ({
                ...image,
                order: index + 1,
            }));
            setHeroImages(nextImages);
            setValue("hero_images", nextImages, { shouldValidate: true });
            toast.success("Hero görseller başarıyla yüklendi.");
        }

        event.target.value = "";
    };

    const onSubmit = async (values: WebContentFormValues) => {
        const payload =
            values.content_type === "logo"
                ? {
                    type: "logo" as const,
                    logo_url: values.logo_url.trim(),
                    logo_public_id: values.logo_public_id.trim(),
                }
                : values.content_type === "hero_title"
                    ? {
                    type: "hero_title" as const,
                    hero_title_first: values.hero_title_first.trim(),
                    hero_title_second: values.hero_title_second.trim(),
                    hero_title_third: values.hero_title_third.trim(),
                }
                    : {
                        type: "hero_images_type" as const,
                        hero_images: normalizedHeroImages,
                    };

        try {
            const response = await createWebContent(payload).unwrap();
            toast.success(response?.message || "İçerik başarıyla oluşturuldu.");
            router.push("/dashboard/web-contents");
        } catch (error) {
            const errorPayload = error as ErrorPayload;
            const originalStatus = Number(errorPayload?.originalStatus ?? errorPayload?.status);
            const isParsingSuccess =
                errorPayload?.status === "PARSING_ERROR" &&
                [200, 201].includes(originalStatus);

            if (isParsingSuccess) {
                toast.success("İçerik başarıyla oluşturuldu.");
                router.push("/dashboard/web-contents");
                return;
            }

            const createdResponse = extractCreatedResponse(errorPayload?.data);
            if (createdResponse) {
                toast.success(createdResponse.message);
                router.push("/dashboard/web-contents");
                return;
            }

            if (typeof errorPayload?.status === "number" && errorPayload.status < 400) {
                toast.success("İçerik başarıyla oluşturuldu.");
                router.push("/dashboard/web-contents");
                return;
            }

            const backendMessage = extractErrorMessage(errorPayload?.data);
            toast.error(backendMessage || "Bir hata oluştu");
        }
    };

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
                <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center text-sm text-slate-500">
                            <span
                                className="hover:text-slate-900 cursor-pointer"
                                onClick={() => router.push("/dashboard/web-contents")}
                            >
                                Web İçerikleri
                            </span>
                            <span className="mx-2">›</span>
                            <span className="font-medium text-slate-900">Yeni İçerik Ekle</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h1 className="text-2xl font-bold text-slate-900">Yeni Web İçeriği Ekle</h1>
                                <p className="text-slate-500 mt-1">
                                    İçerik türünü seçin ve ilgili alanları doldurun.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">İçerik Türü</Label>
                                    <select
                                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
                                        {...register("content_type")}
                                    >
                                        <option value="logo">Logo</option>
                                        <option value="hero_title">Hero Başlık</option>
                                        <option value="hero_images_type">Hero Resimler</option>
                                    </select>
                                </div>

                                {selectedType === "logo" && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-slate-700">Logo Yükle</Label>
                                        <div className="relative rounded-xl border-2 border-dashed border-slate-200 hover:border-[#1A3EB1] bg-slate-50 transition-colors px-4 py-10 text-center">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                onChange={handleLogoUpload}
                                                disabled={isFormBusy}
                                            />
                                            <div className="flex flex-col items-center gap-2">
                                                {isUploadingImage ? (
                                                    <>
                                                        <Loader2 className="h-8 w-8 animate-spin text-[#1A3EB1]" />
                                                        <span className="text-sm text-slate-600">Logo yükleniyor...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="h-8 w-8 text-[#1A3EB1]" />
                                                        <span className="text-sm font-medium text-slate-700">Logo seçmek için tıklayın</span>
                                                        <span className="text-xs text-slate-500">JPG, PNG, WEBP, SVG (Maks 5MB)</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {errors.logo_url && (
                                            <p className="text-red-500 text-xs">{errors.logo_url.message}</p>
                                        )}

                                        {logoUrl ? (
                                            <div className="relative h-28 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                <Image
                                                    src={logoUrl}
                                                    alt="Logo önizleme"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                                                    aria-label="Logoyu kaldır"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {selectedType === "hero_title" && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">Başlık 1. Satır</Label>
                                            <Input
                                                placeholder="Örn: Almanca"
                                                className={`bg-slate-50 border-slate-200 focus-visible:ring-[#1A3EB1] ${errors.hero_title_first ? "border-red-500" : ""}`}
                                                {...register("hero_title_first")}
                                            />
                                            {errors.hero_title_first && (
                                                <p className="text-red-500 text-xs">{errors.hero_title_first.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">Başlık 2. Satır</Label>
                                            <Input
                                                placeholder="Örn: Alman Akademisi'nde"
                                                className={`bg-slate-50 border-slate-200 focus-visible:ring-[#1A3EB1] ${errors.hero_title_second ? "border-red-500" : ""}`}
                                                {...register("hero_title_second")}
                                            />
                                            {errors.hero_title_second && (
                                                <p className="text-red-500 text-xs">{errors.hero_title_second.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">Başlık 3. Satır</Label>
                                            <Input
                                                placeholder="Örn: öğrenilir."
                                                className={`bg-slate-50 border-slate-200 focus-visible:ring-[#1A3EB1] ${errors.hero_title_third ? "border-red-500" : ""}`}
                                                {...register("hero_title_third")}
                                            />
                                            {errors.hero_title_third && (
                                                <p className="text-red-500 text-xs">{errors.hero_title_third.message}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedType === "hero_images_type" && (
                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold text-slate-700">Hero Resimler</Label>
                                        <div className="relative rounded-xl border-2 border-dashed border-slate-200 hover:border-[#1A3EB1] bg-slate-50 transition-colors px-4 py-10 text-center">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                onChange={handleHeroImagesUpload}
                                                disabled={isFormBusy}
                                            />
                                            <div className="flex flex-col items-center gap-2">
                                                {isUploadingImage ? (
                                                    <>
                                                        <Loader2 className="h-8 w-8 animate-spin text-[#1A3EB1]" />
                                                        <span className="text-sm text-slate-600">Görseller yükleniyor...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="h-8 w-8 text-[#1A3EB1]" />
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Hero görseller yüklemek için tıklayın
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            JPG, PNG, WEBP (Maksimum 5MB / dosya)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {errors.hero_images && (
                                            <p className="text-red-500 text-xs">{errors.hero_images.message}</p>
                                        )}

                                        {normalizedHeroImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {normalizedHeroImages.map((image) => (
                                                    <div
                                                        key={image.image_public_id}
                                                        className="group relative h-28 overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        <Image
                                                            src={image.image_url}
                                                            alt="Hero görseli"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <div className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                            #{image.order}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveHeroImage(image.image_public_id)}
                                                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                            aria-label="Görseli kaldır"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isFormBusy}
                                        className="bg-[#1A3EB1] hover:bg-[#15308A] text-white shadow-sm flex items-center gap-2 px-6 h-11 rounded-lg font-medium transition-all"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Kaydediliyor...</span>
                                            </>
                                        ) : (
                                            <span>İçeriği Oluştur</span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
