"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, UploadCloud, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import {
    useCreateCertificateMutation,
    useUploadImageMutation,
} from "@/lib/features/blog/blogApi";

type UploadedCertificate = {
    image_url: string;
    image_public_id: string;
};

type UploadImageResponse = {
    results?: Array<{
        url?: string;
        public_id?: string;
    }>;
};

type ErrorPayload = {
    status?: string | number;
    originalStatus?: number;
    data?: {
        status?: number;
        message?: string;
        detail?: string;
        errors?: Record<string, string[]>;
    } | string | unknown;
};

const extractErrorMessage = (payload: ErrorPayload["data"]) => {
    if (!payload) return "";
    if (typeof payload === "string") return payload;

    if (typeof payload !== "object") return "";

    const payloadRecord = payload as {
        detail?: unknown;
        message?: unknown;
        errors?: unknown;
    };

    if (typeof payloadRecord.detail === "string") return payloadRecord.detail;
    if (typeof payloadRecord.message === "string") return payloadRecord.message;

    if (payloadRecord.errors && typeof payloadRecord.errors === "object") {
        const errorsRecord = payloadRecord.errors as Record<string, unknown>;
        const firstKey = Object.keys(errorsRecord)[0];
        const firstValue = firstKey ? errorsRecord[firstKey] : undefined;

        if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
            return firstValue[0];
        }
    }

    return "";
};

const extractSuccessResponse = (payload: ErrorPayload["data"]) => {
    if (!payload) return null;

    if (typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload) as { status?: number; message?: string };
            const statusCode = Number(parsed.status);
            if ([200, 201].includes(statusCode)) {
                return {
                    status: statusCode,
                    message: parsed.message || "Sertifikalar başarıyla kaydedildi.",
                };
            }
        } catch {
            return null;
        }
    }

    if (typeof payload === "object") {
        const payloadRecord = payload as { status?: unknown; message?: unknown };
        const statusCode = Number(payloadRecord.status);
        if ([200, 201].includes(statusCode)) {
            return {
                status: statusCode,
                message:
                    typeof payloadRecord.message === "string"
                        ? payloadRecord.message
                        : "Sertifikalar başarıyla kaydedildi.",
            };
        }
        return null;
    }

    return null;
};

const parseStatusCode = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const match = value.match(/\d{3}/);
        if (match) return Number(match[0]);
    }
    return NaN;
};

export default function CreateCertificatesPage() {
    const router = useRouter();
    const { isAuthorized, profile, isLoading: isAuthLoading } = useAuthGuard("admin");

    const [uploadedCertificates, setUploadedCertificates] = useState<UploadedCertificate[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isProcessingFiles, setIsProcessingFiles] = useState(false);

    const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
    const [createCertificate, { isLoading: isSaving }] = useCreateCertificateMutation();

    const isBusy = useMemo(
        () => isUploading || isSaving || isProcessingFiles,
        [isUploading, isSaving, isProcessingFiles]
    );

    const processCertificateFiles = async (certificateFiles: File[]) => {
        if (certificateFiles.length === 0) return;

        setIsProcessingFiles(true);
        const uploadedBatch: UploadedCertificate[] = [];

        for (const certificateFile of certificateFiles) {
            if (certificateFile.size > 5 * 1024 * 1024) {
                toast.error(`${certificateFile.name}: Maksimum dosya boyutu 5MB olmalıdır.`);
                continue;
            }

            const formData = new FormData();
            formData.append("file", certificateFile);

            try {
                const uploadResponse = (await uploadImage(formData).unwrap()) as UploadImageResponse;
                const uploadedFile = uploadResponse?.results?.[0];

                if (!uploadedFile?.url || !uploadedFile?.public_id) {
                    throw new Error("Cloudinary yanıtı eksik.");
                }

                uploadedBatch.push({
                    image_url: uploadedFile.url,
                    image_public_id: uploadedFile.public_id,
                });
            } catch {
                toast.error(`${certificateFile.name}: Görsel yüklenemedi.`);
            }
        }

        if (uploadedBatch.length > 0) {
            setUploadedCertificates((prev) => [...prev, ...uploadedBatch]);
            toast.success(`${uploadedBatch.length} sertifika görseli yüklendi.`);
        }

        setIsProcessingFiles(false);
    };

    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const certificateFiles = event.target.files ? Array.from(event.target.files) : [];
        await processCertificateFiles(certificateFiles);
        event.target.value = "";
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);

        const certificateFiles = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
        await processCertificateFiles(certificateFiles);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
    };

    const handleRemoveCertificate = (publicId: string) => {
        setUploadedCertificates((prev) =>
            prev.filter((certificate) => certificate.image_public_id !== publicId)
        );
    };

    const handleSubmit = async () => {
        if (uploadedCertificates.length === 0) {
            toast.error("Lütfen en az bir sertifika görseli yükleyin.");
            return;
        }

        try {
            const result = await createCertificate({ images: uploadedCertificates });

            if ("data" in result && result.data) {
                const successData = result.data as { message?: string };
                toast.success(successData?.message || "Sertifikalar başarıyla kaydedildi.");
                router.push("/dashboard/certificates");
                return;
            }

            const errorPayload = ("error" in result ? result.error : null) as ErrorPayload | null;
            if (!errorPayload) {
                toast.error("Sertifikalar kaydedilirken bir hata oluştu.");
                return;
            }

            const originalStatus = parseStatusCode(errorPayload?.originalStatus);
            const errorStatus = parseStatusCode(errorPayload?.status);
            const rawErrorData =
                typeof errorPayload?.data === "string"
                    ? errorPayload.data
                    : JSON.stringify(errorPayload?.data ?? "");

            const isParsingSuccess =
                errorPayload?.status === "PARSING_ERROR" &&
                (
                    (originalStatus >= 200 && originalStatus < 300) ||
                    /"status"\s*:\s*20\d/.test(rawErrorData) ||
                    /success|updated successfully|created successfully/i.test(rawErrorData)
                );

            if (isParsingSuccess) {
                const successResponse = extractSuccessResponse(errorPayload?.data);
                toast.success(successResponse?.message || "Sertifikalar başarıyla kaydedildi.");
                router.push("/dashboard/certificates");
                return;
            }

            const successResponse = extractSuccessResponse(errorPayload?.data);
            if (successResponse) {
                toast.success(successResponse.message);
                router.push("/dashboard/certificates");
                return;
            }

            if (!Number.isNaN(errorStatus) && errorStatus >= 200 && errorStatus < 300) {
                toast.success("Sertifikalar başarıyla kaydedildi.");
                router.push("/dashboard/certificates");
                return;
            }

            const backendMessage = extractErrorMessage(errorPayload?.data);
            toast.error(backendMessage || "Sertifikalar kaydedilirken bir hata oluştu.");
        } catch (error) {
            const backendMessage = extractErrorMessage((error as ErrorPayload)?.data);
            toast.error(backendMessage || "Sertifikalar kaydedilirken bir hata oluştu.");
        }
    };

    if (isAuthLoading || (!isAuthorized && typeof window !== "undefined")) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A3EB1]" />
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
                                onClick={() => router.push("/dashboard/certificates")}
                            >
                                Sertifikalar
                            </span>
                            <span className="mx-2">›</span>
                            <span className="font-medium text-slate-900">Yeni Sertifika Ekle</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h1 className="text-2xl font-bold text-slate-900">Sertifika Ekle</h1>
                                <p className="text-slate-500 mt-1">
                                    Birden fazla sertifika görseli yükleyebilir ve tek seferde kaydedebilirsiniz.
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div
                                    className={`relative rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                                        isDragActive
                                            ? "border-[#1A3EB1] bg-blue-50/40"
                                            : "border-slate-200 bg-slate-50 hover:border-[#1A3EB1]"
                                    }`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        onChange={handleFileInputChange}
                                        disabled={isBusy}
                                    />

                                    <div className="flex flex-col items-center gap-2">
                                        {isBusy ? (
                                            <>
                                                <Loader2 className="h-8 w-8 animate-spin text-[#1A3EB1]" />
                                                <span className="text-sm text-slate-600">Görseller yükleniyor...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-8 w-8 text-[#1A3EB1]" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    Görselleri sürükleyip bırakın veya seçmek için tıklayın
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    JPG, PNG, WEBP (Maksimum 5MB / dosya)
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {uploadedCertificates.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-semibold text-slate-700">Yüklenen Sertifikalar</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {uploadedCertificates.map((certificate, index) => (
                                                <div
                                                    key={`${certificate.image_public_id}-${index}`}
                                                    className="group relative h-28 overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                >
                                                    <Image
                                                        src={certificate.image_url}
                                                        alt="Sertifika önizleme"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCertificate(certificate.image_public_id)}
                                                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                        aria-label="Sertifikayı kaldır"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isBusy || uploadedCertificates.length === 0}
                                        className="bg-[#1A3EB1] hover:bg-[#15308A] text-white shadow-sm flex items-center gap-2 px-6 h-11 rounded-lg font-medium transition-all"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Kaydediliyor...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                <span>Sertifikaları Kaydet</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
