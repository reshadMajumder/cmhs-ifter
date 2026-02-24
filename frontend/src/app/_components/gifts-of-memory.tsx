'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { ScrollWrapper } from '@/components/scroll-wrapper';

const gifts = [
  {
    name: 'Reunion Mug',
    image: PlaceHolderImages.find(p => p.id === 'gift-mug'),
  },
  {
    name: 'Alumni T-Shirt',
    image: PlaceHolderImages.find(p => p.id === 'gift-tshirt'),
  },
  {
    name: 'School Magazine',
    image: PlaceHolderImages.find(p => p.id === 'gift-magazine'),
  },
];

export default function GiftsOfMemory() {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
            <Gift className="h-10 w-10 text-accent" />
            Gifts of Memory
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            A piece of nostalgia to take home with you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {gifts.map((gift, index) => (
            <ScrollWrapper key={gift.name} delay={`${index * 150}ms`}>
              <Card className="h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                {gift.image && (
                  <div className="relative aspect-square">
                    <Image
                      src={gift.image.imageUrl}
                      alt={gift.image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={gift.image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-center">{gift.name}</CardTitle>
                </CardHeader>
              </Card>
            </ScrollWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
