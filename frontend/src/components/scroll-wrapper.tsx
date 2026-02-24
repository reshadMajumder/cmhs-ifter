'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScrollWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: string;
}

export function ScrollWrapper({ children, className, delay }: ScrollWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove('opacity-0');
          element.classList.add('animate-fade-in-up');
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const style = delay ? { animationDelay: delay } : {};

  return (
    <div ref={ref} className={cn('opacity-0', className)} style={style}>
      {children}
    </div>
  );
}
