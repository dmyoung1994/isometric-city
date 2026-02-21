import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://iso-golf.com'),
  title: {
    default: 'ISOGOLF — Golf Course Builder',
    template: 'ISOGOLF — %s',
    absolute: 'ISOGOLF — Golf Course Builder',
  },
  description: 'Build and manage the ultimate golf course. Design holes, maintain fairways, and delight golfers.',
  openGraph: {
    title: 'ISOGOLF — Golf Course Builder',
    description: 'Build and manage the ultimate golf course. Design holes, maintain fairways, and delight golfers.',
    type: 'website',
    siteName: 'IsoGolf',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'IsoGolf - golf course builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISOGOLF — Golf Course Builder',
    description: 'Build and manage the ultimate golf course. Design holes, maintain fairways, and delight golfers.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IsoGolf',
  },
};

export default function GolfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
