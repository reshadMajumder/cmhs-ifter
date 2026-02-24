import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function GiftsSection() {
  const giftImage = PlaceHolderImages.find(p => p.id === 'gift-section');

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <Gift className="text-accent" />
          Exclusive Gifts
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {giftImage && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image
              src={giftImage.imageUrl}
              alt={giftImage.description}
              fill
              className="object-cover"
              data-ai-hint={giftImage.imageHint}
            />
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Take a piece of nostalgia home with you. Every attendee will receive an exclusive souvenir kit, including a custom yearbook, an alumni T-shirt, and other special memorabilia to remember this day.
        </p>
      </CardContent>
    </Card>
  );
}
