'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User, Calendar, Heart, Camera } from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  onLogout: () => void;
}

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/events', icon: Calendar, label: 'My Events' },
    { href: '/dashboard/photobooth', icon: Camera, label: 'Photo Frame' },
    { href: '/dashboard/donate', icon: Heart, label: 'Donate' },
]

export default function SidebarNav({ onLogout }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">RBMB Reunion</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                <Link
                    href={item.href}
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                        pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onLogout} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
