
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Theater } from 'lucide-react';

export default function CulturalSection() {
  const culturalImage = PlaceHolderImages.find(p => p.id === 'cultural-section');

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <Theater className="text-accent" />
          Cultural Program
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {culturalImage && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image
              src={culturalImage.imageUrl}
              alt={culturalImage.description}
              fill
              className="object-cover"
              data-ai-hint={culturalImage.imageHint}
            />
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Enjoy a vibrant cultural program featuring performances from current and former students, celebrating our school's rich artistic heritage. From nostalgic songs to captivating drama, there's something for everyone.
        </p>
      </CardContent>
    </Card>
  );
}
