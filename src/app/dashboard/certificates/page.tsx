"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    type CertificateItem,
    useDeleteCertificateMutation,
    useGetCertificatesQuery,
} from "@/lib/features/blog/blogApi";

const PAGE_SIZE = 10;

const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const normalizeImageUrl = (urlValue: string | null | undefined) => {
    if (!urlValue) return "";
    if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
    return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
};

export default function CertificatesPage() {
    const router = useRouter();
    const { isAuthorized, profile, isLoading: isAuthLoading } = useAuthGuard("admin");

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedForDetail, setSelectedForDetail] = useState<CertificateItem | null>(null);
    const [selectedForDelete, setSelectedForDelete] = useState<CertificateItem | null>(null);

    const {
        data: certificatesResponse,
        isLoading: isCertificatesLoading,
        isFetching: isCertificatesFetching,
    } = useGetCertificatesQuery(
        { page: currentPage, ordering: "-created_at" },
        { skip: !isAuthorized }
    );

    const [deleteCertificate, { isLoading: isDeleting }] = useDeleteCertificateMutation();

    const certificates = certificatesResponse?.results ?? [];
    const totalCount = certificatesResponse?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const hasNext = Boolean(certificatesResponse?.next);
    const hasPrevious = Boolean(certificatesResponse?.previous);

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }, [currentPage, totalPages]);

    const handleDelete = async () => {
        if (!selectedForDelete) return;

        try {
            const response = await deleteCertificate(selectedForDelete.id).unwrap();
            toast.success(response?.message || "Sertifika başarıyla silindi.");
            setSelectedForDelete(null);
        } catch {
            toast.error("Sertifika silinirken bir hata oluştu.");
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
                <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sertifikalar</h1>
                        <Button
                            onClick={() => router.push("/dashboard/certificates/create")}
                            className="bg-[#1A3EB1] hover:bg-[#15308A] text-white shadow-sm flex items-center gap-2 px-6 h-11 rounded-lg font-medium transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Sertifika Ekle
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto relative min-h-[340px]">
                            {(isCertificatesLoading || isCertificatesFetching) && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#1A3EB1]" />
                                </div>
                            )}

                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-slate-100 bg-slate-50/50">
                                        <TableHead className="font-semibold text-xs text-slate-500 w-[30%] py-4 px-4 lg:px-6">
                                            SERTİFİKA GÖRSELİ
                                        </TableHead>
                                        <TableHead className="font-semibold text-xs text-slate-500 w-[45%] py-4 px-4 lg:px-6">
                                            OLUŞTURULMA TARİHİ
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isCertificatesLoading ? (
                                        Array.from({ length: 5 }).map((_, idx) => (
                                            <TableRow key={idx} className="animate-pulse">
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="h-20 w-20 rounded-md bg-slate-200" />
                                                </TableCell>
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="h-4 w-36 rounded bg-slate-200" />
                                                </TableCell>
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="ml-auto flex w-fit items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-slate-200" />
                                                        <div className="h-8 w-8 rounded bg-slate-200" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : certificates.length > 0 ? (
                                        certificates.map((item) => (
                                            <TableRow key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <div className="relative h-20 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                                        {normalizeImageUrl(item.image_url) ? (
                                                            <Image
                                                                src={normalizeImageUrl(item.image_url)}
                                                                alt="Sertifika görseli"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full bg-slate-200" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-b border-slate-100 py-4 px-4 lg:px-6">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {formatDateTime(item.created_at)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-48 text-center text-slate-500">
                                                {!isCertificatesLoading && !isCertificatesFetching && "Henüz sertifika eklenmemiş."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalCount > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                <span className="text-sm text-slate-500 font-medium">
                                    Toplam <span className="text-slate-900">{totalCount}</span> sertifika
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-slate-600 bg-white"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={!hasPrevious}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex items-center gap-1 px-2">
                                        {pageNumbers.map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`h-8 w-8 rounded-md text-sm font-semibold transition-colors ${
                                                    currentPage === pageNumber
                                                        ? "bg-[#1A3EB1] text-white"
                                                        : "text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-slate-600 bg-white"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={!hasNext}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={Boolean(selectedForDetail)} onOpenChange={(open) => !open && setSelectedForDetail(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Sertifika Detayı</DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {selectedForDetail && normalizeImageUrl(selectedForDetail.image_url) ? (
                            <Image
                                src={normalizeImageUrl(selectedForDetail.image_url)}
                                alt="Sertifika detayı"
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="h-full w-full bg-slate-200" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(selectedForDelete)} onOpenChange={(open) => !open && setSelectedForDelete(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">Sertifika Sil</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm text-slate-600">
                        Seçili sertifikayı silmek istediğinize emin misiniz?
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedForDelete(null)}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50"
                            disabled={isDeleting}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
