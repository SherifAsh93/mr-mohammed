import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mr-mohammed.vercel.app"),
  title: { default: "أ. محمد | مدرس رياضيات", template: "%s | أ. محمد" },
  description: "موقع أ. محمد لتعليم الرياضيات — مواد تعليمية، جداول حصص، نتائج الطلاب، وكل ما تحتاجه في مكان واحد.",
  keywords: ["مدرس رياضيات", "رياضيات ثانوي", "مذكرات", "نتائج طلاب", "جدول حصص"],
  authors: [{ name: "أ. محمد" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "أ. محمد",
  },
  openGraph: {
    title: "أ. محمد | مدرس رياضيات",
    description: "موقع أ. محمد لتعليم الرياضيات — مواد تعليمية، جداول حصص، ونتائج الطلاب.",
    type: "website",
    locale: "ar_EG",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a3a6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={cairo.variable}>
        {children}
      </body>
    </html>
  );
}
