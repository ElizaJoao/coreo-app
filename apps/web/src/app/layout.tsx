import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Coreo — AI Choreography Planner",
  description:
    "Generate complete choreography plans for your fitness or dance class in seconds.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen m-0 bg-[#0D0D0D] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

