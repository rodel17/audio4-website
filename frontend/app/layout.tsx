import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { getContent } from "@/lib/catalog";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getContent("site");
  return {
    title: { default: site.seoTitle, template: `%s | ${site.shortName}` },
    description: site.seoDescription,
    openGraph: site.shareImageUrl ? { images: [site.shareImageUrl] } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getContent("site");
  // The brand color is editable in Site settings; globals.css reads it from this variable.
  const style = { "--color-brand": site.brandColor } as React.CSSProperties;

  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`} style={style}>
      <body className="flex min-h-screen flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
