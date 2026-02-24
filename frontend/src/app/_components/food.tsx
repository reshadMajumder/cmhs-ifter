import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function FoodSection() {
  const foodImage = PlaceHolderImages.find(p => p.id === 'food-section');

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <UtensilsCrossed className="text-accent" />
          Culinary Delights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {foodImage && (
          <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
            <Image
              src={foodImage.imageUrl}
              alt={foodImage.description}
              fill
              className="object-cover"
              data-ai-hint={foodImage.imageHint}
            />
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Savor a wide array of delicious dishes throughout the event. From welcome drinks and appetizers to a grand gala dinner, our menu is designed to delight every palate. Special dietary options will be available.
        </p>
      </CardContent>
    </Card>
  );
}
