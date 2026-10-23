import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { CustomCursor } from "@/components/motion/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ACADA Cooperative",
    template: "%s | ACADA Cooperative",
  },
  description:
    "Cooperative Society Management Platform — contributions, loans, and deduction schedules.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* `data-scroll-behavior` tells Next to keep the smooth scroll through
       route transitions instead of snapping to the top. */
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        /* Browser extensions (Grammarly, Read Aloud, …) inject their own
           attributes onto <body> before React hydrates, which React reports
           as a hydration mismatch. The warning is about the extension, not
           about our markup, so it is suppressed here. */
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}
