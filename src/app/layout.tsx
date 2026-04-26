import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import { SideNav } from "@/components/SideNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoTc = Noto_Sans_TC({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-tc",
});

export const metadata: Metadata = {
  title: "台北找樂 — 情境感知玩樂推薦",
  description: "AI 即時在地玩樂推播 / Distance, fare & nearby attractions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${inter.variable} ${notoTc.variable}`}>
      <body>
        <SideNav />
        <div className="pl-14">{children}</div>
      </body>
    </html>
  );
}
