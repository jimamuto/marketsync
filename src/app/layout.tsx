import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketSync",
  description: "Market synchronization and B2B booking platform for farmers and institutional buyers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
