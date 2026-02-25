'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, Heart, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/constants';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const totalCapacity = 1000;
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
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="py-20 bg-transparent overflow-hidden font-body">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-headline">Registration at a Glance</h2>
          <p className="text-lg text-muted-foreground mt-2 font-body">See who's coming to our grand reunion!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            { title: "Total Registered", value: stats.total_registered, span: `/${totalCapacity}`, icon: <Users className="h-6 w-6 text-accent" />, color: "text-accent" },
            { title: "Male CMHSIANs", value: stats.gender_count.male || 0, icon: <User className="h-6 w-6 text-primary" />, color: "text-primary" },
            { title: "Female CMHSIANs", value: stats.gender_count.female || 0, icon: <Heart className="h-6 w-6 text-pink-500" />, color: "text-pink-500" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-3">
                    {item.icon}
                    <span className="font-headline">{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-5xl font-bold", item.color)}>
                    {item.value}
                    {item.span && <span className="text-3xl text-muted-foreground">{item.span}</span>}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-headline">Batch-wise Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {batchData.length === 0 ? (
                <div className="text-center py-12 bg-accent/5 rounded-xl border border-dashed border-accent/20">
                  <p className="text-xl text-muted-foreground font-body">
                    No registrations yet. <br />
                    <span className="text-accent font-bold italic">Be the first to start the registration!</span>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {batchData.slice(0, visibleCount).map((batch, index) => (
                    <motion.div
                      key={batch.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + (index % 12) * 0.05 }}
                    >
                      <Card className="text-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg font-headline">{batch.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-3xl font-bold text-primary">{batch.count}</p>
                          <p className="text-sm text-muted-foreground">Registered</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
            {visibleCount < batchData.length && (
              <CardFooter className="justify-center">
                <Button onClick={showMore} variant="outline" className="hover:bg-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Load More
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
