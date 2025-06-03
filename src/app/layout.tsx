import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap"
});

export const metadata: Metadata = {
  title: "30v Juhlat",
  description: "Tervetuloa juhlimaan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
