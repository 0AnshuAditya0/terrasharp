import type { Metadata } from "next";
import { Anta, Montserrat } from "next/font/google";
import "./globals.css";
import NavLinks from "@/components/ui/NavLinks";
import MotionProvider from "@/components/ui/MotionProvider";

const anta = Anta({ subsets: ["latin"], variable: "--font-anta", weight: "400" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "TerraSharp — Sharper Earth. More Signal.",
  description: "AI-powered super-resolution for Sentinel-2 imagery, transforming medium-resolution observations into sharper Earth intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`bg-background ${anta.variable} ${montserrat.variable}`}>
      <body>
        <MotionProvider>
          <header className="site-header">
            <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-6 lg:px-10">
              <a href="/" className="font-mono text-sm font-bold uppercase tracking-[0.22em] text-foreground">Terra<span className="text-primary">/</span>Sharp</a>
              <NavLinks />
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-border bg-background px-6 py-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">TerraSharp · Sentinel-2 super-resolution</footer>
        </MotionProvider>
      </body>
    </html>
  );
}
