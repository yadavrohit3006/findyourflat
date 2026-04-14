import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FindYourFlat — Browse flats on a map',
  description: 'Discover rooms and flats available near you, directly on an interactive map.',
  keywords: ['flat', 'room', 'flatmate', 'rent', 'map', 'India'],
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
