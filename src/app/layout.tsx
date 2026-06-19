import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "MarketSync",
  description: "Market synchronization and B2B booking platform for farmers and institutional buyers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
