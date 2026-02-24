'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-1000',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative">
        <Image
          src="https://res.cloudinary.com/dzgs1uhn0/image/upload/v1761468825/rbmb2-loader-removebg-preview_dicca6.png"
          alt="Loading..."
          width={200}
          height={200}
          className="animate-pulse"
          unoptimized
        />
      </div>

    </div>
  );
}
