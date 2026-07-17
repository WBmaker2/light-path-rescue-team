import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://light-path-rescue-team.wbmaker.chatgpt.site"),
  title: "빛길 구조대 | 거울과 렌즈로 빛의 길을 살펴봐요",
  description: "초등 5~6학년이 빛의 직진, 반사, 렌즈를 지날 때의 변화를 살펴보는 활동입니다.",
  openGraph: { title: "빛길 구조대", description: "거울과 렌즈로 빛의 길을 살펴봐요", images: [{ url: "/og.png", width: 1200, height: 630, alt: "빛길 구조대" }] },
  twitter: { card: "summary_large_image", title: "빛길 구조대", description: "거울과 렌즈로 빛의 길을 살펴봐요", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#071b3b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
