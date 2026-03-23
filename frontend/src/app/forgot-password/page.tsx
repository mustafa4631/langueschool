"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useForgotPasswordMutation } from "@/lib/features/auth/authApi";
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

const forgotPasswordSchema = z.object({
    username_or_email: z.string().min(1, { message: "Kullanıcı adı veya e-posta giriniz." }),
});

export default function ForgotPasswordPage() {
    const [forgotPassword, { isLoading: isSubmitting }] = useForgotPasswordMutation();
    const { data: logoContentData, isLoading: isLogoQueryLoading, isFetching: isLogoQueryFetching } =
        useGetWebpageContentsQuery({ ordering: "-created_at" });
    const isLogoLoading = isLogoQueryLoading || isLogoQueryFetching;

    const logoContent = useMemo(
        () => logoContentData?.results?.find((item) => item.type === "logo"),
        [logoContentData?.results]
    );
    const dynamicLogo = logoContent?.logo_url?.trim() ? logoContent.logo_url : "/logo.webp";

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            username_or_email: "",
        },
    });

    const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
        try {
            await forgotPassword(values).unwrap();
            toast.success("Şifreniz e-posta adresinize başarıyla gönderildi");
            form.reset();
        } catch (error: any) {
            toast.error(error?.data?.message || error?.data?.detail || "Kullanıcı bulunamadı");
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
                        <h1 className="text-xl font-bold text-slate-800 mb-1">Şifremi Unuttum</h1>
                        <p className="text-sm text-slate-400">
                            Şifre sıfırlama bağlantısı için kullanıcı adı veya e-posta girin.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username_or_email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Kullanıcı Adı veya E-posta
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                                    <Mail className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Kullanıcı Adı veya E-posta"
                                                    className="pl-11 h-12 rounded-xl bg-transparent border-slate-200 focus-visible:ring-[#1A3EB1]/20 focus-visible:border-[#1A3EB1]"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-[#1A3EB1] hover:bg-[#1A3EB1]/90 text-white rounded-xl font-medium text-[15px] shadow-sm transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    "Gönder"
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
