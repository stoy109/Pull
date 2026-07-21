import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Lato,
  Manrope,
} from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const manrope = Manrope({
  variable: "--font-worker-sans",
  subsets: ["latin"],
  preload: false,
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-worker-display",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Pull",
  description: "Platform kolaborasi untuk UMKM dan pekerja.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${lato.variable} ${geistMono.variable} ${manrope.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
