"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FlaskConical } from "lucide-react";

const partnerLogosList = [
    { src: "/arge1.png", alt: "Alman Akademisi R&D" },
    { src: "/arge2.png", alt: "Teknopark Samsun" },
    { src: "/arge3.png", alt: "Ondokuz Mayıs Üniversitesi" },
] as const;

const logoContainerStyle =
    "rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8";

export default function ArgeDepartmaniPage() {
    const renderResearchPartners = () => (
        <section className={`mt-16 ${logoContainerStyle}`}>
            <h2 className="text-center text-2xl font-bold tracking-tight text-[#1a365d]">
                İş Birliklerimiz ve Yetkilendirmeler
            </h2>
            <div className="mt-8 grid grid-cols-1 items-center justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {partnerLogosList.map((logoItem) => (
                    <div
                        key={logoItem.alt}
                        className="flex h-28 w-full items-center justify-center rounded-2xl bg-white px-6 shadow-sm"
                    >
                        <Image
                            src={logoItem.src}
                            alt={logoItem.alt}
                            width={240}
                            height={80}
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
                <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Link href="/" className="transition-colors hover:text-[#1a365d]">
                        Anasayfa
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900">Ar-Ge Departmanı</span>
                </nav>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)]">
                    <div className="border-b border-slate-100 bg-linear-to-r from-[#1a365d]/5 to-[#8DC63F]/10 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-[#1a365d]">
                                    Ar-Ge Departmanı
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    Alman Akademisi'nin inovasyon ve akademik iş birliği odaklı araştırma-geliştirme faaliyetleri.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="space-y-5 text-[15px] leading-relaxed text-slate-700">
                            <p>
                                Ar-Ge Departmanımız, dil eğitimi alanında teknoloji destekli
                                öğrenme yöntemleri geliştirmek, eğitim içerik kalitesini artırmak
                                ve sürdürülebilir akademik modeller üretmek amacıyla çalışır.
                            </p>
                            <p>
                                Üniversite-sanayi iş birliği yaklaşımıyla yürütülen projelerde;
                                ölçme-değerlendirme süreçleri, dijital eğitim deneyimi ve
                                öğretim verimliliği gibi başlıklarda yenilikçi çözümler üretilir.
                            </p>
                        </div>

                        {renderResearchPartners()}
                    </div>
                </section>
            </div>
        </main>
    );
}
