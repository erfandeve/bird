import type { Metadata, Viewport } from "next";
import { Markazi_Text, Vazirmatn } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/layout/Toaster";
import { JsonLd } from "@/components/layout/JsonLd";
import { CartFlight } from "@/components/birds/CartFlight";
import { AuthBootstrap } from "@/components/layout/AuthBootstrap";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir", display: "swap" });
const markazi = Markazi_Text({ subsets: ["arabic", "latin"], variable: "--font-markazi", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "fa_IR", siteName: site.name, title: site.title, description: site.description, url: "/" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f9f9e8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${markazi.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/brand/miloo-logo.png` },
              {
                "@type": "WebSite",
                name: site.name,
                url: site.url,
                inLanguage: "fa-IR",
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${site.url}/shop?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:p-3">پرش به محتوای اصلی</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
        <AuthBootstrap />
        <CartDrawer />
        <CartFlight />
        <Toaster />
      </body>
    </html>
  );
}
