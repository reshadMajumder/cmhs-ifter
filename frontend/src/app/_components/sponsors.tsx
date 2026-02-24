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
    <div className="flex flex-col items-center justify-center gap-4 w-40 h-32 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-border">
        <span className="text-sm text-muted-foreground">Sponsor Slot</span>
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
        <h2 className="text-4xl md:text-5xl font-bold font-headline mb-4">Our Valued Sponsors</h2>
        <p className="text-lg text-muted-foreground mb-12">This event is made possible by their generous support.</p>
        
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-4">
                    <Skeleton className="h-20 w-32" />
                    <Skeleton className="h-6 w-24" />
                </div>
            ))
          ) : sponsors.length > 0 ? (
            sponsors.map((sponsor) => (
             sponsor.logo && (
                <div key={sponsor.id} className="flex flex-col items-center gap-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 w-40">
                    <div className="relative h-20 w-32">
                    <Image
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        fill
                        className="object-contain"
                        />
                    </div>
                    <span className="font-semibold text-muted-foreground capitalize">{sponsor.name}</span>
                </div>
              )
            ))
          ) : (
             Array.from({ length: 4 }).map((_, index) => (
                <EmptySponsorSlot key={index} />
             ))
          )}
        </div>
      </div>
    </section>
  );
}
