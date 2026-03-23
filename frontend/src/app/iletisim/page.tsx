"use client";

import Link from "next/link";
import { ChevronRight, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const externalLinks = {
    instagram: "https://instagram.com/almanakademisi",
    linkedin: "https://linkedin.com/company/alman-akademisi",
    whatsapp: "https://wa.me/905393688669",
} as const;
const whatsappLinkAction = externalLinks.whatsapp;

const contactPageInfo = {
    whatsapp: "+90 539 368 86 69",
    email: "merhaba@almanakademisi.com",
    landline: "0850 840 83 03",
};

const contactMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.482024103632!2d36.2642593!3d41.332305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408779ebca36f01b%3A0x67c158401c217717!2sAlman%20Akademisi!5e0!3m2!1str!2str!4v1710000000000";

const branchLocationInfo = {
    title: "Samsun Şubesi",
    address: "Atakent, 3131. Sk. 10/B, 55000 Atakum/Samsun, Türkiye",
    mapLink: "https://www.google.com/maps/place/?q=place_id:ChIJG_A2y-l5iEARF3chHEBYweg",
};

const contactGridWrapper = "grid grid-cols-1 gap-8 py-12 md:grid-cols-2";
const contactRowWrapper = "flex items-center gap-3";

const contactIconSize = {
    landline: 24,
    email: 24,
    social: 40,
} as const;

const whatsappButtonProps = {
    href: whatsappLinkAction,
    target: "_blank",
    rel: "noopener noreferrer",
    className:
        "inline-flex w-full items-center justify-start gap-3 rounded-2xl bg-[#25D366] px-5 py-5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:bg-[#22c55e]",
} as const;

const socialMediaLinks = [
    {
        name: "Instagram",
        url: externalLinks.instagram,
        Icon: Instagram,
        iconClass: "text-[#E4405F]",
        buttonClass:
            "border border-slate-200 bg-white hover:border-pink-200 hover:bg-pink-50",
    },
    {
        name: "LinkedIn",
        url: externalLinks.linkedin,
        Icon: Linkedin,
        iconClass: "text-[#0A66C2]",
        buttonClass:
            "border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50",
    },
] as const;

export default function ContactPage() {
    const handleSocialClick = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };
    const whatsappBrandIcon = (
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
    );

    const renderContactCards = () => {
        return (
            <div className={contactGridWrapper}>
                <a {...whatsappButtonProps}>
                    <div className={contactRowWrapper}>
                        {whatsappBrandIcon}
                        <span>{contactPageInfo.whatsapp}</span>
                    </div>
                </a>

                <a
                    href="tel:08508408303"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#1A3EB1]/30"
                >
                    <div className="mb-2 flex items-center gap-2">
                        <Phone size={contactIconSize.landline} className="text-[#1A3EB1]" />
                        <p className="font-semibold text-slate-800">Sabit Hat</p>
                    </div>
                    <p className="text-sm text-slate-700">{contactPageInfo.landline}</p>
                </a>

                <a
                    href={`mailto:${contactPageInfo.email}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#1A3EB1]/30"
                >
                    <div className="mb-2 flex items-center gap-2">
                        <Mail size={contactIconSize.email} className="text-[#1A3EB1]" />
                        <p className="font-semibold text-slate-800">E-posta</p>
                    </div>
                    <p className="text-sm text-slate-700">{contactPageInfo.email}</p>
                </a>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-3 font-semibold text-slate-800">Sosyal Medya</p>
                    <div className="flex items-center gap-6">
                        {socialMediaLinks.map((socialItem) => (
                            <button
                                key={socialItem.name}
                                type="button"
                                aria-label={socialItem.name}
                                onClick={() => handleSocialClick(socialItem.url)}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${socialItem.buttonClass}`}
                            >
                                <socialItem.Icon size={contactIconSize.social} className={socialItem.iconClass} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Link href="/" className="transition-colors hover:text-[#1a365d]">
                        Anasayfa
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900">İletişim</span>
                </nav>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)]">
                    <div className="border-b border-slate-100 bg-linear-to-r from-[#1a365d]/5 to-[#8DC63F]/10 p-6 sm:p-8">
                        <h1 className="text-3xl font-black tracking-tight text-[#1a365d]">
                            İletişim
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Alman Akademisi ile tüm iletişim kanallarımız üzerinden hemen bağlantı kurabilirsiniz.
                        </p>
                    </div>

                    <div className="px-6 sm:px-8">{renderContactCards()}</div>

                    <div className="mx-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:mx-8">
                        <div className="mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#1A3EB1]" />
                            <p className="font-semibold text-slate-800">{branchLocationInfo.title}</p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">
                            {branchLocationInfo.address}
                        </p>
                        <a
                            href={branchLocationInfo.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center text-sm font-medium text-[#1A3EB1] transition-colors hover:text-[#16328f] hover:underline"
                        >
                            Google Maps'te Aç
                        </a>
                    </div>

                    <div className="px-6 pb-8 sm:px-8">
                        <iframe
                            title="Alman Akademisi Atakum Konum"
                            src={contactMapUrl}
                            className="mt-10 h-[450px] w-full rounded-2xl shadow-md"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}
