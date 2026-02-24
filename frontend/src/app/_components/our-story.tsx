import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function OurStory() {
  const storyImage = PlaceHolderImages.find(p => p.id === 'our-story');

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
            <BookOpen className="h-10 w-10 text-accent" />
            Our Story
          </h2>
          <p className="text-lg text-muted-foreground mt-2">A journey through time at Ranir Bazar High School.</p>
        </div>
        
        <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="font-headline text-3xl font-bold mb-4">From Humble Beginnings to a Legacy of Excellence</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Established decades ago, Ranir Bazar High School started as a small seed of knowledge in our community. Through the years, it has grown into a mighty tree, nurturing thousands of students who have gone on to make their mark on the world.
                  </p>
                  <p>
                    We remember the chalk-dusted classrooms, the echoing laughter in the hallways, the competitive spirit on the sports field, and the lifelong friendships forged within these walls. This reunion is a celebration of that shared history, a chance to honor our past and inspire our future.
                  </p>
                  <p>
                    Let's come together to relive those golden days and celebrate the enduring spirit of RBMB.
                  </p>
                </div>
              </div>
              <div className="relative min-h-[300px] lg:min-h-[400px]">
                {storyImage && (
                  <Image 
                    src={storyImage.imageUrl} 
                    alt={storyImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={storyImage.imageHint}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
