import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Inter covers Kazakh Cyrillic (ә, ғ, қ, ң, ө, ұ, ү, һ, і) via cyrillic-ext
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Birge — покупаем вместе, дешевле",
  description:
    "Все маркетплейсы в одном приложении: Kaspi.kz, Wildberries, Ozon и AliExpress в тенге. Групповые покупки до −35%.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00a3c4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
