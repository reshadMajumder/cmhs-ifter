
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, LogIn, Heart, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constants';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      if (isMenuOpen) {
        setIsHeaderVisible(true);
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check login status from localStorage
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);

    // Listen for storage changes to update login status across tabs
    const handleStorageChange = () => {
      const newLoggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn !== newLoggedInStatus) {
        setIsLoggedIn(newLoggedInStatus);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoggedIn, lastScrollY, isMenuOpen]);

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

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const authButton = (isMobile: boolean) => isLoggedIn ? (
    <Button
      variant={isMobile ? "outline" : "ghost"}
      asChild
      size="lg"
      className={cn(
        "w-full sm:w-auto",
        !isMobile ? "text-white hover:bg-white/10 hover:text-white" : "border-black text-black hover:bg-black/5"
      )}
      onClick={closeMenu}
    >
      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-5 w-5" />Dashboard</Link>
    </Button>
  ) : (
    <Button
      variant={isMobile ? "outline" : "ghost"}
      asChild
      size="lg"
      className={cn(
        "w-full sm:w-auto",
        !isMobile ? "text-white hover:bg-white/10 hover:text-white" : "border-black text-black hover:bg-black/5"
      )}
      onClick={closeMenu}
    >
      <Link href="/login"><LogIn className="mr-2 h-5 w-5" />Login</Link>
    </Button>
  );

  return (
    <header
      className={cn(
        'absolute top-0 z-40 w-full transition-all duration-300',
        isMenuOpen ? 'bg-white shadow-xl' : 'bg-black/10 backdrop-blur-sm',
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Logo className="h-10 w-10 transition-transform hover:scale-110" />
          <h1 className={cn(
            "hidden text-xl font-bold tracking-tight sm:block font-headline transition-colors",
            isMenuOpen ? "text-black" : "text-white"
          )}>
            CMHSians
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/contact"><MessageSquare className="mr-2 h-4 w-4" /> Contact Us</Link>
          </Button>
          <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/dashboard/donate"><Heart className="mr-2 h-4 w-4" /> Donate</Link>
          </Button>
          {authButton(false)}
          {isLoggedIn && (
            <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10 hover:text-white">Logout</Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "transition-colors",
              isMenuOpen ? "text-black hover:bg-black/10" : "text-white hover:bg-white/10"
            )}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="sm:hidden p-6 border-t border-gray-100 bg-white animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            <Button variant="outline" asChild className="w-full justify-start border-gray-200 text-black hover:bg-black/5" onClick={closeMenu}>
              <Link href="/contact"><MessageSquare className="mr-2 h-4 w-4" /> Contact Us</Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start border-gray-200 text-black hover:bg-black/5" onClick={closeMenu}>
              <Link href="/dashboard/donate"><Heart className="mr-2 h-4 w-4" /> Donate</Link>
            </Button>
            <div className="h-px bg-gray-100 my-2" />
            {authButton(true)}
            {isLoggedIn && (
              <Button variant="outline" className="w-full justify-start border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleLogout}>Logout</Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
