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
  title: "Saku 30v - Syntymäpäivä & Valmistujaisjuhlat",
  description: "Tervetuloa juhlimaan Sakun 30-vuotissyntymäpäiviä ja valmistujaisia! Pelejä, hauskaa yhdessäoloa ja unohtumattomia hetkiä.",
  keywords: ["saku", "30v", "syntymäpäivä", "valmistujaiset", "juhlat", "party"],
  authors: [{ name: "Saku" }],
  creator: "Saku",
  publisher: "Saku",
  metadataBase: new URL('https://saku30v.fi'),
  openGraph: {
    type: 'website',
    locale: 'fi_FI',
    url: 'https://saku30v.fi',
    title: 'Saku 30v - Syntymäpäivä & Valmistujaisjuhlat',
    description: 'Tervetuloa juhlimaan Sakun 30-vuotissyntymäpäiviä ja valmistujaisia!',
    siteName: 'Saku 30v',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saku 30v - Syntymäpäivä & Valmistujaisjuhlat',
    description: 'Tervetuloa juhlimaan Sakun 30-vuotissyntymäpäiviä ja valmistujaisia!',
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
        <meta name="theme-color" content="#667eea" />
      </head>
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
