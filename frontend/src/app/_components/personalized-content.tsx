
'use client';

import { useState, useEffect } from 'react';
import { getPersonalizedSectionsAction } from '@/app/actions';
import GiftsSection from './gifts';
import FoodSection from './food';
import CulturalSection from './cultural';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollWrapper } from '@/components/scroll-wrapper';
import { Gift, UtensilsCrossed, Theater } from 'lucide-react';

const sectionComponents: { [key: string]: React.ComponentType } = {
  Gifts: GiftsSection,
  Food: FoodSection,
  Cultural: CulturalSection,
};

export default function PersonalizedContent() {
  const [sections, setSections] = useState<string[] | null>(null);

  useEffect(() => {
    // This effect runs once on component mount to fetch personalized sections.
    // The user activity and school info are hardcoded for demonstration purposes.
    const userActivity = "User has spent time on the pricing and story sections, suggesting interest in the event's offerings and heritage.";
    const schoolInfo = "Ranir Bazar High School is well-regarded for its annual cultural festivals, which include music and food stalls, and for giving memorable souvenirs.";

    async function fetchSections() {
      try {
        const result = await getPersonalizedSectionsAction({ userActivity, schoolInfo });
        setSections(result);
      } catch (error) {
        console.error("Failed to fetch personalized sections, showing all as a fallback.", error);
        setSections(['Gifts', 'Food', 'Cultural']);
      }
    }
    
    // Adding a small delay to simulate network latency and show the loading state
    const timer = setTimeout(fetchSections, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!sections) {
    // Loading state with skeletons
    return (
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (sections.length === 0) {
    return null; // Don't render anything if no sections are returned
  }

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline">Event Highlights</h2>
          <p className="text-lg text-muted-foreground mt-2">A sneak peek into what awaits you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((sectionName, index) => {
            const Component = sectionComponents[sectionName];
            if (!Component) return null;
            return (
              <ScrollWrapper key={sectionName} delay={`${index * 150}ms`}>
                <Component />
              </ScrollWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const CardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);
