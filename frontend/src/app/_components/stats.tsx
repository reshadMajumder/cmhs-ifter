
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, Heart, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/constants';

const totalCapacity = 2000;
const INITIAL_VISIBLE_COUNT = 12;

interface RegistrationStats {
    total_registered: number;
    batch_wise_count: { [key: string]: number };
    gender_count: {
        male: number;
        female: number;
    };
}

export default function Stats() {
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stats/registration-stats/`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const batchData = stats 
    ? Object.entries(stats.batch_wise_count)
        .map(([year, count]) => ({ name: year, count }))
        .sort((a, b) => Number(b.name) - Number(a.name))
    : [];

  const showMore = () => {
    setVisibleCount(batchData.length);
  };
  
  if (isLoading) {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                 <Skeleton className="h-64 w-full" />
            </div>
        </section>
    )
  }

  if (!stats) {
    return null; // Or some error state
  }


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline">Registration at a Glance</h2>
          <p className="text-lg text-muted-foreground mt-2">See who's coming to our grand reunion!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <Users className="text-accent" />
                <span>Total Registered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-accent">{stats.total_registered}<span className="text-3xl text-muted-foreground">/{totalCapacity}</span></p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <User className="text-primary" />
                <span>Male RBMBIANs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">{stats.gender_count.male || 0}</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3">
                <Heart className="text-pink-500" />
                <span>Female RBMBIANs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-pink-500">{stats.gender_count.female || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-headline">Batch-wise Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {batchData.slice(0, visibleCount).map((batch) => (
                <Card key={batch.name} className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-headline">{batch.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-3xl font-bold text-primary">{batch.count}</p>
                    <p className="text-sm text-muted-foreground">Registered</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          {visibleCount < batchData.length && (
            <CardFooter className="justify-center">
              <Button onClick={showMore} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Load More
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  );
}
