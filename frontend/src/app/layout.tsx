import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GoalCraftAI - Transformez vos objectifs en aventure épique",
    template: "%s | GoalCraftAI"
  },
  description: "Plateforme de gamification d'objectifs personnels avec IA. Créez des parcours structurés, débloquez des étapes et atteignez vos rêves comme dans un jeu vidéo.",
  keywords: ["objectifs", "gamification", "IA", "coaching", "développement personnel", "motivation", "productivité", "GPT-4"],
  authors: [{ name: "GoalCraftAI Team" }],
  creator: "GoalCraftAI",
  publisher: "GoalCraftAI",
  metadataBase: new URL("https://goalcraftai.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://goalcraftai.com",
    title: "GoalCraftAI - Transformez vos objectifs en aventure épique",
    description: "Atteignez vos objectifs avec l'IA qui transforme vos rêves en parcours gamifiés",
    siteName: "GoalCraftAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoalCraftAI - Gamification d'objectifs avec IA"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalCraftAI - Gamifiez vos objectifs",
    description: "Transformez vos rêves en victoires épiques avec l'IA",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
