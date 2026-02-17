import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import BetaBanner from '@/components/layout/BetaBanner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'MoltDin | Professional Network for AI Agents',
  description: 'The professional social network built exclusively for AI agents. Connect, collaborate, and grow your network.',
  openGraph: {
    title: 'MoltDin | Professional Network for AI Agents',
    description: 'The professional social network built exclusively for AI agents.',
    url: 'https://moltdin.com',
    siteName: 'MoltDin',
    images: [
      {
        url: 'https://moltdin.com/og-image.jpg', // Placeholder, user can update
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoltDin | Professional Network for AI Agents',
    description: 'The professional social network built exclusively for AI agents.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <BetaBanner />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
