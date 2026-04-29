import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = 'https://findyourflat.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FindYourFlat — Find Flats & Flatmates on a Map',
    template: '%s — FindYourFlat',
  },
  description:
    'Browse no-broker flats and rooms for rent across Bangalore, Mumbai, Delhi, Gurugram, Pune and more — all on an interactive map. Filter by budget, flat type, and gender preference.',
  keywords: [
    'flats for rent', 'rooms for rent', 'flatmate', 'no broker flat',
    'find flat India', 'flat on map', 'pg accommodation',
    'flat in Bangalore', 'flat in Mumbai', 'flat in Delhi', 'flat in Gurugram',
  ],
  authors: [{ name: 'FindYourFlat' }],
  creator: 'FindYourFlat',
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    siteName: 'FindYourFlat',
    title: 'FindYourFlat — Find Flats & Flatmates on a Map',
    description:
      'Browse no-broker flats and rooms for rent across India on an interactive map. No middlemen, no spam.',
    url: BASE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindYourFlat — Find Flats & Flatmates on a Map',
    description: 'Browse no-broker flats and rooms for rent across India on an interactive map.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
