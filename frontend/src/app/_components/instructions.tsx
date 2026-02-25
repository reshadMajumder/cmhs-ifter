import { Card, CardContent } from '@/components/ui/card';

export default function Instructions() {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline">How to Register</h2>
          <p className="text-lg text-muted-foreground mt-2">Follow our simple video guide to secure your spot.</p>
        </div>

        <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <iframe
                src="https://www.youtube.com/embed/gFCgXzl8bzo"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
