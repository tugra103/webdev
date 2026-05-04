
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FingerprintProvider } from '@fingerprint/react'
import { AuthProvider } from "@/context/AuthContext";
import SessionWrapper from "@/comporents/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Donut",
  description: "Donut Ana Sayfa",
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
      <body className="min-h-full flex flex-col">        
        <AuthProvider>
        <FingerprintProvider
          apiKey="GZPxUkuA0MLMwf37sk9s"
          region="eu"
        ><SessionWrapper>
          {children}
        </SessionWrapper></FingerprintProvider>
        </AuthProvider>
        </body>
    </html>
  );
}
