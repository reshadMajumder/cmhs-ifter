import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, CalendarDays } from 'lucide-react';

export default function Venue() {
  const venueImage = PlaceHolderImages.find(p => p.id === 'venue-image');

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline">Event Venue</h2>
          <p className="text-lg text-muted-foreground mt-2">Where we'll be celebrating.</p>
        </div>

        <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative min-h-[300px] md:min-h-[450px]">
              {venueImage && (
                <Image
                  src={venueImage.imageUrl}
                  alt={venueImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={venueImage.imageHint}
                />
              )}
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
              <h3 className="text-3xl font-bold font-headline mb-6">Ranir Bazar High School Campus</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-8 w-8 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold">Location</h4>
                    <p className="text-muted-foreground">Ranir Bazar High School Field</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CalendarDays className="h-8 w-8 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold">Date & Time</h4>
                    <p className="text-muted-foreground">Monday, March 23, 2026</p>
                    {/* <p className="text-muted-foreground">10:00 AM onwards</p> */}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3663.314839576028!2d91.20762207!3d23.34060554!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754802f3fc4599f%3A0xd63df85ac573b215!2sRanir%20Bazar%20High%20School!5e0!3m2!1sen!2sbd!4v1762189089717!5m2!1sen!2sbd"
                  ></iframe>
                </div>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
