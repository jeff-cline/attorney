import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { PrelaunchBanner } from "@/components/prelaunch-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FortyFour } from "@/components/forty-four";

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

export const metadata: Metadata = {
  title: "Attorney.plus — Resolve disputes by agreement",
  description:
    "Two parties, one fair process. Reach a quick decision by mutual agreement — or escalate to professional arbitration, then to attorneys. Every step timestamped.",
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
        <PrelaunchBanner />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FortyFour />
      </body>
    </html>
  );
}
