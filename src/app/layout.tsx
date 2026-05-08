import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrelaunchBanner } from "@/components/prelaunch-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FortyFour } from "@/components/forty-four";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attorney.plus — Quick decision arbitration",
  description:
    "Two parties. One platform. Settle disputes by mutual agreement first — or escalate to professional arbitration, then attorneys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
