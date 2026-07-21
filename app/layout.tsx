import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mr-mohammed-gamma.vercel.app"),
  title: { default: "أ. محمد | معلم لغة عربية وتربية إسلامية", template: "%s | أ. محمد" },
  description: "موقع أستاذ محمد — دورات اللغة العربية والتربية الإسلامية أونلاين. سجّل في دوراتك، حمّل المواد، وتابع نتائجك.",
  keywords: ["معلم لغة عربية", "تربية إسلامية", "دورات أونلاين", "خطيب مسجد", "تعليم القرآن", "تجويد"],
  authors: [{ name: "أ. محمد" }],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "أ. محمد" },
  openGraph: {
    title: "أ. محمد | دورات أونلاين",
    description: "دورات اللغة العربية والتربية الإسلامية — سجّل الآن",
    type: "website",
    locale: "ar_EG",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a6b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={cairo.variable}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
