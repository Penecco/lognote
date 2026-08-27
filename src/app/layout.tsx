import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lognote-penecco.vercel.app"),
  title: "ろぐのーと",
  description: "テンプレートで簡単にプロフィールを作れます！",
  openGraph: {
    images: ["/images/lognote-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ろぐのーと",
    description: "テンプレートで簡単にプロフィールを作れます！",
    images: ["/images/lognote-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${zenMaruGothic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
