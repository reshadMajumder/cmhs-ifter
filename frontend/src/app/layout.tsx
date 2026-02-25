import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMHS GRAND IFTAR MAHFIL 2026',
  description: 'Join us for the CMHS GRAND IFTAR MAHFIL 2026.',
  icons: {
    icon: 'https://res.cloudinary.com/dzdf1wu5x/image/upload/v1771998698/Expressive_Graffiti_Logo_for_Ramadan_Iftar-removebg-preview_ixylto.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&family=Gloria+Hallelujah&family=Kaushan+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
