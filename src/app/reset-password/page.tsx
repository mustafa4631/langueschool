"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/lib/features/auth/authApi";
import { useGetWebpageContentsQuery } from "@/lib/features/blog/blogApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const resetPasswordSchema = z
    .object({
        new_password: z.string().min(8, { message: "Yeni şifre en az 8 karakter olmalıdır." }),
        confirm_password: z.string().min(8, { message: "Yeni şifre (tekrar) en az 8 karakter olmalıdır." }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Şifreler eşleşmiyor.",
        path: ["confirm_password"],
    });

export default function ResetPasswordPage() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetPassword, { isLoading: isSubmitting }] = useResetPasswordMutation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetEmail = searchParams.get("email")?.trim() ?? "";
    const { data: logoContentData, isLoading: isLogoQueryLoading, isFetching: isLogoQueryFetching } =
        useGetWebpageContentsQuery({ ordering: "-created_at" });
    const isLogoLoading = isLogoQueryLoading || isLogoQueryFetching;

    const logoContent = useMemo(
        () => logoContentData?.results?.find((item) => item.type === "logo"),
        [logoContentData?.results]
    );
    const dynamicLogo = logoContent?.logo_url?.trim() ? logoContent.logo_url : "/logo.webp";

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            new_password: "",
            confirm_password: "",
        },
    });

    const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
        if (!targetEmail) {
            toast.error("Hata oluştu");
            return;
        }

        const newPassword = values.new_password;
        const confirmPassword = values.confirm_password;

        try {
            await resetPassword({
                email: targetEmail,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }).unwrap();

            toast.success("Şifreniz başarıyla güncellendi");
            router.push("/login");
        } catch (error: any) {
            toast.error(error?.data?.message || error?.data?.detail || "Hata oluştu");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFBFF] flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-[450px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none px-4 py-6 sm:px-8 sm:py-10">
                <CardHeader className="flex flex-col items-center p-0 mb-8 space-y-4">
                    <div>
                        <Link href="/">
                            <Image
                                src={isLogoLoading ? "/logo.webp" : dynamicLogo}
                                alt="Alman Akademisi Logo"
                                width={200}
                                height={100}
                                className="h-32 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="text-center -mt-4">
                        <h1 className="text-xl font-bold text-slate-800 mb-1">Şifreyi Yenile</h1>
                        <p className="text-sm text-slate-400">
                            Yeni şifrenizi belirleyerek hesabınıza güvenle devam edin.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
                            <FormItem className="space-y-2">
                                <FormLabel className="text-sm font-semibold text-slate-700">E-posta</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        value={targetEmail}
                                        disabled
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-500"
                                    />
                                </FormControl>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Yeni Şifre
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                                    <Lock className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-11 pr-11 h-12 rounded-xl bg-transparent border-slate-200 focus-visible:ring-[#1A3EB1]/20 focus-visible:border-[#1A3EB1]"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Yeni Şifre (Tekrar)
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                                    <Lock className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-11 pr-11 h-12 rounded-xl bg-transparent border-slate-200 focus-visible:ring-[#1A3EB1]/20 focus-visible:border-[#1A3EB1]"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting || !targetEmail}
                                className="w-full h-12 bg-[#1A3EB1] hover:bg-[#1A3EB1]/90 text-white rounded-xl font-medium text-[15px] shadow-sm transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Güncelleniyor...
                                    </>
                                ) : (
                                    "Şifreyi Güncelle"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                <Link href="/login" className="text-sm font-semibold text-[#1A3EB1] hover:underline">
                    Giriş Sayfasına Dön
                </Link>
            </div>
        </div>
    );
}
