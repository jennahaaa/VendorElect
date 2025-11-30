import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { NavBar } from "@/components/NavBar";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VendorElect - Vendor Potential Rating System",
  description: "FHE-powered vendor potential rating tool with full data privacy protection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${playfair.variable} ${lora.variable}`}>
      <body className="antialiased">
        <Web3Provider>
          <NavBar />
        {children}
        </Web3Provider>
      </body>
    </html>
  );
}
