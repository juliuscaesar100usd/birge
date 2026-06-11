import type { Metadata, Viewport } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Golos Text — strong Cyrillic incl. Kazakh letters (ә, ғ, қ, ң, ө, ұ, ү, һ, і)
const golos = Golos_Text({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-golos",
});

export const metadata: Metadata = {
  title: "Zigle — покупай вместе, дешевле",
  description:
    "Один маркетплейс для всего мира: AliExpress, Temu, Wildberries и Ozon в тенге. Собирайте группу — и цена падает до −45%.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1668e3",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${golos.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
