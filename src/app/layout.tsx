import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
export const metadata: Metadata = { title: "Extrator DRE", description: "Consolidação local de planilhas financeiras.", manifest: "/manifest.webmanifest", icons: { icon: "/favicon.svg", apple: "/apple-icon" } };
export const viewport: Viewport = { themeColor: "#f5f5f7" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}<Analytics /></body></html>; }
