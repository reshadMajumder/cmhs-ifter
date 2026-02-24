
'use client';

import Link from 'next/link';
import Countdown from '@/components/countdown';
import { Button } from '@/components/ui/button';
import { ArrowDown, Ticket } from 'lucide-react';

export default function Hero() {
  const scrollToContent = () => {
    const heroHeight = window.innerHeight * 0.9;
    window.scrollTo({ top: heroHeight, behavior: 'smooth' });
  }

  return (
    <section className="relative h-[90svh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <iframe
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
          style={{ width: '177.77vh', height: '100vw' }} // Maintain 16:9 aspect ratio
          src="https://www.youtube.com/embed/E76SnhwEeaE?autoplay=1&mute=1&loop=1&playlist=E76SnhwEeaE&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Hero Background Video"
        ></iframe>
      </div>
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center">
        <h2 className="font-headline text-2xl md:text-4xl text-amber-300 drop-shadow-lg mb-4">
          RBMB grand reunion 2026
        </h2>
        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight drop-shadow-2xl">
          Back to Where It All Began
        </h1>
        <p className="mt-4 max-w-2xl text-md md:text-xl text-white/90 font-body">
          Join us for the grand reunion of Ranir Bazar High School. Reconnect, reminisce, and create new memories.
        </p>
        <div className="mt-12 w-full max-w-2xl">
          <Countdown />
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/register">
                    <Ticket className="mr-2 h-5 w-5" />
                    Get Your Ticket
                </Link>
            </Button>
        </div>
        <Button variant="ghost" size="icon" className="absolute bottom-4 animate-bounce" onClick={scrollToContent}>
          <ArrowDown className="h-8 w-8 text-white" />
        </Button>
      </div>
    </section>
  );
}
