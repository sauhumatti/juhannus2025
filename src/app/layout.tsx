import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Juhannus 2025 - Perinteinen Juhannusjuhla",
  description: "Tervetuloa viettämään perinteistä juhannusta! Mölkkyä, grillailua, saunomista ja yhteisön voimaa kesän kirkkaimpana yönä.",
  keywords: ["juhannus", "2025", "juhannusjuhla", "perinteinen", "mölkky", "sauna", "grillaus", "kesäjuhla"],
  authors: [{ name: "Juhannus 2025" }],
  creator: "Juhannus 2025",
  publisher: "Juhannus 2025",
  metadataBase: new URL('https://juhannus2025.fi'),
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    url: 'https://juhannus2025.fi',
    title: 'Juhannus 2025 - Perinteinen Juhannusjuhla',
    description: 'Tervetuloa viettämään perinteistä juhannusta! Mölkkyä, grillailua, saunomista ja yhteisön voimaa.',
    siteName: 'Juhannus 2025',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juhannus 2025 - Perinteinen Juhannusjuhla',
    description: 'Tervetuloa viettämään perinteistä juhannusta! Mölkkyä, grillailua, saunomista ja yhteisön voimaa.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add this after Google Search Console verification
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#228B22" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
