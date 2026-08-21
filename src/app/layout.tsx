import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FortyFour } from "@/components/forty-four";
import { ImpersonationBanner } from "@/components/impersonation-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Modern transitional serif for headlines — authority + editorial gravitas.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const DESC =
  "Reach a quick decision you both accept — or escalate to professional arbitration, then attorneys. Every step timestamped and tamper-evident.";

export const metadata: Metadata = {
  metadataBase: new URL("https://attorney.plus"),
  title: "Attorney.plus — Resolve disputes by agreement",
  description: DESC,
  openGraph: {
    title: "Attorney.plus — Resolve disputes by agreement",
    description: DESC,
    url: "https://attorney.plus",
    siteName: "Attorney.plus",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Attorney.plus — Settle it by agreement, not by attrition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Attorney.plus — Resolve disputes by agreement",
    description: DESC,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ImpersonationBanner />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FortyFour />
        {/* Quuik pc.js — visitor insight + identification, same tracking stack as our other sites */}
        <Script src="https://quuik.com/api/pc.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
