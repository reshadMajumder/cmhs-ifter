
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Pricing() {
  const features = [
    'Delicious Iftar Spread',
    'Meet with teachers',
    'Interactive Photo Booth Access',
    'Networking with Fellow Alumni'
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Registration Details</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Secure your spot for the most awaited CMHS Grand Iftar Mahfil 2026. One simple pass for an unforgettable evening.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden border-accent/20 bg-background shadow-2xl hover:shadow-accent/10 transition-all duration-500 overflow-visible group">
            {/* Decorative gradient corner */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/20 blur-3xl rounded-full group-hover:bg-accent/40 transition-all duration-700"></div>

            <div className="flex flex-col md:flex-row">
              {/* Left Side: Pricing Info */}
              <div className="md:w-2/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-center items-center text-center bg-accent/5">
                <div className="bg-accent/10 p-4 rounded-full mb-6 ring-4 ring-accent/5">
                  <Star className="h-10 w-10 text-accent animate-pulse" />
                </div>
                <CardTitle className="font-headline text-3xl mb-2">Grand Passage</CardTitle>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-6xl font-black text-foreground tracking-tighter">350</span>
                  <span className="text-2xl font-bold text-accent">TK</span>
                </div>
                <p className="text-muted-foreground mt-2 font-medium">All-Inclusive Registration</p>
              </div>

              {/* Right Side: Features & Action */}
              <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                    What&apos;s Included
                    <div className="h-px flex-grow bg-border/50"></div>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 group/item">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                        <span className="text-muted-foreground text-sm font-body leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                  <Button asChild size="lg" className="w-full sm:w-auto px-10 py-7 text-lg font-bold shadow-xl shadow-accent/20 bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 transition-all">
                    <Link href="/register" className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Register Now
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground italic text-center sm:text-left">
                    *Limited capacity available. <br className="hidden sm:block" />
                    Register early to avoid disappointment.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
