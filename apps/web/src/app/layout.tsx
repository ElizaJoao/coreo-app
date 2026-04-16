import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen m-0 bg-[#0D0D0D] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

