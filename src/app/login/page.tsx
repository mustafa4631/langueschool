"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/lib/features/auth/authApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthSession, setAuthToken } from "@/lib/features/auth/authSessionSlice";
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

// Form Validation Schema
const loginSchema = z.object({
    username_or_email: z.string().min(1, { message: "Kullanıcı adı veya e-posta giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

type LoginSuccessPayload = {
    access: string;
    refresh: string;
    expires_time?: number;
    expires_in?: number;
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { data: logoContentData, isLoading: isLogoQueryLoading, isFetching: isLogoQueryFetching } =
        useGetWebpageContentsQuery({ ordering: "-created_at" });
    const isLogoLoading = isLogoQueryLoading || isLogoQueryFetching;

    const logoContent = useMemo(
        () => logoContentData?.results?.find((item) => item.type === "logo"),
        [logoContentData?.results]
    );
    const dynamicLogo = logoContent?.logo_url?.trim() ? logoContent.logo_url : "/logo.webp";

    const updateAuthStorage = (credentials: LoginSuccessPayload) => {
        const expiresInSeconds = Number(credentials.expires_in ?? credentials.expires_time ?? 0);
        const tokenExpiryDate = Date.now() + Math.max(expiresInSeconds, 0) * 1000;

        // Force overwrite legacy auth keys to prevent stale token races.
        localStorage.setItem("access", credentials.access);
        localStorage.setItem("refresh", credentials.refresh);
        localStorage.setItem("expires_time", String(tokenExpiryDate));

        const isStorageUpdated =
            localStorage.getItem("access") === credentials.access &&
            localStorage.getItem("refresh") === credentials.refresh &&
            localStorage.getItem("expires_time") === String(tokenExpiryDate);

        return { isStorageUpdated, tokenExpiryDate };
    };

    const fetchProfileWithToken = async (accessToken: string) => {
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users/profile/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const profilePayload = await profileResponse.json();

        if (!profileResponse.ok) {
            throw { data: profilePayload };
        }

        return profilePayload as {
            email: string;
            username: string;
            first_name: string;
            last_name: string;
            user_type: string;
        };
    };

    const handleLoginSuccess = (
        credentials: LoginSuccessPayload,
        profileResult: {
            email: string;
            username: string;
            first_name: string;
            last_name: string;
            user_type: string;
        }
    ) => {
        dispatch(
            setAuthSession({
                user: {
                    email: profileResult.email,
                    username: profileResult.username,
                    first_name: profileResult.first_name,
                    last_name: profileResult.last_name,
                    user_type: profileResult.user_type,
                },
                token: credentials.access,
            })
        );

        if (profileResult.user_type === "admin") {
            toast.success("Giriş başarılı! Dashboard'a yönlendiriliyorsunuz...");
            router.push("/dashboard");
            router.refresh();
            return;
        }

        toast.success("Giriş başarılı, yönlendiriliyorsunuz...");
        router.push("/");
        router.refresh();
    };

    // Initialize React Hook Form
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username_or_email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            const response = await login({
                username_or_email: values.username_or_email,
                password: values.password,
            }).unwrap();

            const { isStorageUpdated } = updateAuthStorage(response);
            if (!isStorageUpdated || !localStorage.getItem("access")) {
                toast.error("Oturum bilgileri kaydedilemedi. Lütfen tekrar deneyin.");
                return;
            }

            dispatch(setAuthToken(response.access));
            const profileResult = await fetchProfileWithToken(response.access);
            handleLoginSuccess(response, profileResult);
        } catch (error: any) {
            console.error("Login Error:", error);
            // Default error message, you can map different status codes if needed
            toast.error(error?.data?.detail || "Kullanıcı adı veya şifre hatalı.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFBFF] flex flex-col items-center justify-center p-4">
            {/* Login Card */}
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
                        <p className="text-sm text-slate-400">
                            Giriş yaparak öğrenmeye başlayın.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Username or Email Field */}
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

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Şifre
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                                    <Lock className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-11 pr-11 h-12 rounded-xl bg-transparent border-slate-200 focus-visible:ring-[#1A3EB1]/20 focus-visible:border-[#1A3EB1]"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                >
                                                    {showPassword ? (
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

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-[#1A3EB1] hover:underline"
                                >
                                    Şifremi Unuttum?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-[#1A3EB1] hover:bg-[#1A3EB1]/90 text-white rounded-xl font-medium text-[15px] shadow-sm transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Giriş Yapılıyor...
                                    </>
                                ) : (
                                    "Giriş Yap"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Footer Links & Signup */}
            <div className="mt-8 text-center space-y-6">
                <p className="text-sm text-slate-500">
                    Hesabınız yok mu?{" "}
                    <Link href="/register" className="font-bold text-[#1A3EB1] hover:underline">
                        Ücretsiz kaydolun
                    </Link>
                </p>

                <div className="flex items-center justify-center gap-6 text-xs font-medium text-slate-400">
                    <Link href="#" className="hover:text-slate-600 transition-colors">
                        Hakkımızda
                    </Link>
                    <Link href="#" className="hover:text-slate-600 transition-colors">
                        Gizlilik
                    </Link>
                    <Link href="#" className="hover:text-slate-600 transition-colors">
                        Yardım
                    </Link>
                </div>
            </div>
        </div>
    );
}
