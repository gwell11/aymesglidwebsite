import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./medieval-font.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aymes Glidewell",
  description: "The portfolio of Aymes Glidewell — creative technologist, artist, and builder.",
};

import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased circuit-bg`}
      >
        <Navbar />
        <BackButton />
        {children}
      </body>
    </html>
  );
}
