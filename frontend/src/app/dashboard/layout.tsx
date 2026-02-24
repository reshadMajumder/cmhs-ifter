
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, LogOut, User, Calendar, PanelLeft, Heart, Camera } from 'lucide-react';
import SidebarNav from './_components/sidebar-nav';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/events', icon: Calendar, label: 'My Events' },
    { href: '/dashboard/photobooth', icon: Camera, label: 'Photo Frame' },
    { href: '/dashboard/donate', icon: Heart, label: 'Donate' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/accounts/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    // Always clear local storage and redirect
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('refreshToken');
    router.replace('/login');
  };

  if (!isClient) {
    // You can return a loader here
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <SidebarNav onLogout={handleLogout} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">RBMB Reunion</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("flex items-center gap-4 px-2.5",
                            pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setIsSheetOpen(false)}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
                 <button
                  onClick={() => {
                    handleLogout();
                    setIsSheetOpen(false);
                  }}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
           {/* Can add a mobile menu trigger here */}
        </header>
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
