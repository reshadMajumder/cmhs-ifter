import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

export default function MusicSection() {
  const musicImage = PlaceHolderImages.find(p => p.id === 'music-section');

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <Music className="text-accent" />
          Live Music & DJ
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {musicImage && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image
              src={musicImage.imageUrl}
              alt={musicImage.description}
              fill
              className="object-cover"
              data-ai-hint={musicImage.imageHint}
            />
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Get ready to groove to the beats! We have a live band playing nostalgic hits from across the decades, followed by a DJ to keep the party going all night long. It's time to hit the dance floor with old friends.
        </p>
      </CardContent>
    </Card>
  );
}
