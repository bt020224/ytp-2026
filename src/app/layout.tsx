import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台北找樂 — 情境感知玩樂推薦",
  description: "AI 即時在地玩樂推播 / Distance, fare & nearby attractions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
