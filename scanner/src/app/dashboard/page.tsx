"use client";

import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Phone, Utensils, DoorOpen, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      router.push('/login');
    }
  };

  const actions = [
    {
      title: "Check Entrance (QR)",
      description: "Scan QR for fast entry",
      icon: <QrCode className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/scan/entrance",
      color: "bg-primary/15 text-primary",
      borderColor: "border-primary/20",
    },
    {
      title: "Entrance (Manual)",
      description: "Lookup by guest phone",
      icon: <Phone className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/manual/entrance",
      color: "bg-primary/10 text-primary",
      borderColor: "border-primary/10",
    },
    {
      title: "Serve Food (QR)",
      description: "Verify food entitlements",
      icon: <Utensils className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/scan/food",
      color: "bg-accent/15 text-accent",
      borderColor: "border-accent/20",
    },
    {
      title: "Food (Manual)",
      description: "Manual service lookup",
      icon: <Phone className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/manual/food",
      color: "bg-accent/10 text-accent",
      borderColor: "border-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <LayoutDashboard size={18} className="text-primary-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold font-headline text-primary">Verify</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-9 w-9">
              <Settings size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive rounded-full hover:bg-destructive/10 h-9 w-9"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} className={isLoggingOut ? "animate-pulse" : ""} />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <section className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold font-headline">Welcome back</h2>
          <p className="text-muted-foreground text-xs md:text-sm">Event Personnel • Active Session</p>
        </section>

        {/* Quick Actions Grid - Updated to 2 columns on mobile */}
        <section className="grid grid-cols-2 gap-3 md:gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href} className="group active:scale-[0.98] transition-all">
              <Card className={`h-full border-2 ${action.borderColor} group-hover:border-primary/40 transition-colors p-4 md:p-6 flex flex-col gap-3 md:gap-4 relative overflow-hidden bg-card/50`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${action.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="space-y-0.5 md:space-y-1">
                  <CardTitle className="text-sm md:text-lg font-bold font-headline leading-tight">{action.title}</CardTitle>
                  <CardDescription className="text-[10px] md:text-sm font-medium line-clamp-2 md:line-clamp-none">{action.description}</CardDescription>
                </div>
                
                {/* Decorative corner icon */}
                <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity hidden md:block">
                  {action.title.includes('Entrance') ? <DoorOpen size={60} /> : <Utensils size={60} />}
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </main>

      <footer className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col items-center gap-3">
        <div className="h-px w-full bg-border/50 mb-2" />
        
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
          EventPass Verify v1.0.0
        </p>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
            <p className="text-[10px] text-muted-foreground font-medium">Server Connected</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-0.5">
            <p className="text-[9px] text-muted-foreground/70 font-medium">
              Developed by <a href="https://www.reshad.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">www.reshad.dev</a>
            </p>
            <p className="text-[9px] text-muted-foreground/60 font-medium tracking-wide">
              Phone: +8801627076527
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
