'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/constants';
import { Card } from '@/components/ui/card';

interface Sponsor {
  id: number;
  name: string;
  logo: string;
  serial_number: number;
}

const EmptySponsorSlot = () => (
  <div className="flex flex-col items-center justify-center gap-4 w-32 h-32 p-4 rounded-full border-2 border-dashed border-border group hover:border-primary/40 transition-colors">
    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">Open<br />Slot</span>
  </div>
);

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notice/sponsors/`);
        if (!response.ok) {
          throw new Error('Failed to fetch sponsors');
        }
        const data = await response.json();
        setSponsors(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSponsors();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-foreground">Our Valued Sponsors</h2>
        <p className="text-lg text-muted-foreground mb-12">This event is made possible by their generous support.</p>

        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-12">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : sponsors.length > 0 ? (
            sponsors.map((sponsor) => (
              sponsor.logo && (
                <div key={sponsor.id} className="flex flex-col items-center gap-4 group w-32">
                  <div className="relative h-32 w-32 rounded-full border-2 border-primary/10 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300 overflow-hidden flex items-center justify-center">
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-full"
                    />
                  </div>
                  <span className="font-bold text-sm text-black capitalize text-center leading-tight group-hover:text-primary transition-colors">{sponsor.name}</span>
                </div>
              )
            ))
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-12">
              {Array.from({ length: 4 }).map((_, index) => (
                <EmptySponsorSlot key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
