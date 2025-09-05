import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthSessionProvider } from "@/providers/session-provider";
import SettingsInitializer from "@/components/SettingsInitializer";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary } from "@/lib/i18n/utils";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: {
      default: dict.metadata.title,
      template: "%s | GoalCraftAI"
    },
    description: dict.metadata.description,
    keywords: ["objectifs", "gamification", "IA", "coaching", "développement personnel", "motivation", "productivité", "GPT-4"],
    authors: [{ name: "GoalCraftAI Team" }],
    creator: "GoalCraftAI",
    publisher: "GoalCraftAI",
    metadataBase: new URL("https://goalcraftai.com"),
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US",
      url: `https://goalcraftai.com/${locale}`,
      title: dict.metadata.title,
      description: dict.metadata.description,
      siteName: "GoalCraftAI",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "GoalCraftAI"
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      creator: "@goalcraftai",
      images: ["/twitter-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google-site-verification-code",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  
  // Valider que la locale existe
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsInitializer />
        <AuthSessionProvider>
          <I18nProvider locale={locale} dictionary={dictionary}>
            {children}
          </I18nProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}