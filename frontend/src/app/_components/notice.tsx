
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/constants';

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Notice() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notice/`);
        if (!response.ok) {
          throw new Error('Failed to fetch notices');
        }
        const data = await response.json();
        setNotices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotices();
  }, []);

  return (
    <section className="py-20 bg-background/80">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
            <Megaphone className="h-10 w-10 text-accent" />
            Notice Board
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Latest news and updates about the grand reunion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id} className="flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{notice.title}</CardTitle>
                  <p className="text-sm text-muted-foreground pt-1">
                    Posted on: {new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{notice.content}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="p-0 h-auto">
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}


const CardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="flex-grow">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full mt-2" />
             <Skeleton className="h-4 w-2/3 mt-2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-6 w-20" />
        </CardFooter>
    </Card>
)
