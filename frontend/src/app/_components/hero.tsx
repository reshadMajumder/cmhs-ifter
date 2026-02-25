'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Countdown from '@/components/countdown';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white">
      {/* Fixed Background Video */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
        <iframe
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
          style={{ width: '177.77vh', height: '100vw' }} // Maintain 16:9 aspect ratio
          src="https://www.youtube.com/embed/kIlX43frIQk?autoplay=1&mute=1&loop=1&playlist=kIlX43frIQk&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Hero Background Video"
        ></iframe>
      </div>

      {/* Scrolling Content */}
      <div className="relative z-20 container mx-auto px-4 pt-20 md:pt-0 flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2, ease: "easeOut" }}
          className="font-invitation text-sm md:text-3xl lg:text-4xl text-amber-300 drop-shadow-glow mb-2 uppercase"
        >
          CMHS GRAND IFTAR MAHFIL 2026
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95, letterSpacing: "-0.05em" }}
          animate={{ opacity: 1, scale: 1, letterSpacing: "-0.02em" }}
          transition={{ duration: 1, delay: 0.3, ease: "circOut" }}
          className="font-headline text-4xl sm:text-4xl md:text-6xl lg:text-8xl font-bold leading-tight drop-shadow-2xl text-outline mb-4"
        >
          Back to Where It All Began
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="max-w-xl text-xs md:text-lg text-white/80 font-body mb-8"
        >
          Join us for the CMHS GRAND IFTAR MAHFIL 2026. <br className="hidden md:block" /> Reconnect, reminisce, and create new memories.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="w-full max-w-2xl mt-0"
        >
          <Countdown />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button variant="outline" size="lg" asChild className="border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 hover:text-cyan-200 hover:border-cyan-300 shadow-lg transition-all px-8 py-6 text-lg">
            <Link href="/register">
              <Ticket className="mr-2 h-6 w-6" />
              Get Your Ticket
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
