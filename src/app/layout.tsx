import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Extrator DRE Olist", description: "Consolidação local de vendas Olist" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
