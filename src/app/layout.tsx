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

const siteDescription =
  "Aymes Glidewell — Systems Applications Engineer specializing in building management systems (BMS), DDC controls, BACnet/MSTP and Modbus networking, and embedded systems.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aymesglidewell.com"),
  title: "Aymes Glidewell · Systems Applications Engineer",
  description: siteDescription,
  openGraph: {
    title: "Aymes Glidewell · Systems Applications Engineer",
    description: siteDescription,
    url: "https://www.aymesglidewell.com",
    siteName: "Aymes Glidewell",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aymes Glidewell · Systems Applications Engineer",
    description: siteDescription,
  },
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
