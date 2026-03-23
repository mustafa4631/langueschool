import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { Toaster } from "react-hot-toast";
import { LayoutShell } from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_FAVICON = "/logo.webp";

const normalizeLogoUrl = (urlValue: string | null | undefined) => {
  if (!urlValue) return "";
  if (urlValue.startsWith("http://") || urlValue.startsWith("https://")) return urlValue;
  return `${process.env.NEXT_PUBLIC_API_URL}${urlValue}`;
};

export async function generateMetadata(): Promise<Metadata> {
  let dynamicIcon = DEFAULT_FAVICON;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}blog/webpage-content-list/`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const payload = (await response.json()) as {
        results?: Array<{ type?: string; logo_url?: string | null; logo?: string | null; image_url?: string | null }>;
      };
      const latest = payload?.results?.find((item) => item.type === "logo");
      const logoCandidate = latest?.logo_url || latest?.logo || latest?.image_url || "";
      const normalized = normalizeLogoUrl(logoCandidate);
      if (normalized) {
        dynamicIcon = normalized;
      }
    }
  } catch {
    dynamicIcon = DEFAULT_FAVICON;
  }

  return {
    title: "Alman Akademisi",
    description: "Alman Akademisi ile Almanca'yı online öğrenin.",
    icons: {
      icon: dynamicIcon,
      shortcut: dynamicIcon,
      apple: dynamicIcon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <StoreProvider>
          <LayoutShell>{children}</LayoutShell>
        </StoreProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
