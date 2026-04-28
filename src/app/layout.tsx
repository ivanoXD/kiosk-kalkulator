import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Kiosk Kalkulator",
  description: "Interni alat za ponude i narudžbe",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex h-screen print:h-auto print:block bg-slate-50 text-slate-900 overflow-hidden print:overflow-visible font-sans selection:bg-indigo-500/30">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full print:h-auto overflow-y-auto print:overflow-visible bg-slate-50 relative print:bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
