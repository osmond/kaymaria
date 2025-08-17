import "./globals.css";
import type { Metadata, Viewport } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Kay Maria",
  description: "Plant care companion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Avoid hydration mismatches when extensions add attributes to <html>
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
