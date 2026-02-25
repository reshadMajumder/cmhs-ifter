import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="h-10 w-10" />
              <span className="text-lg font-bold font-headline">
                CMHS GRAND IFTER 2026
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} CMHS Alumni Association. All Rights Reserved.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4 font-headline text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              {/* <li><Link href="/register" className="hover:text-primary transition-colors">Register</Link></li> */}
              {/* <li><Link href="/donations" className="hover:text-primary transition-colors">Donations</Link></li> */}
              <li><Link href="/#" className="hover:text-primary transition-colors">Donations</Link></li>

            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 font-headline text-lg">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" /></a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" /></a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Designed & Developed by{' '}
            <a
              href="https://reshad.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Reshad
            </a>
            {' '} | {' '}
            <a
              href="https://www.facebook.com/jojo.reshad/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Facebook
            </a>
            {' '} | {' '}
            <a
              href="https://wa.me/8801627076527"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              WhatsApp
            </a>

            {/* email */}
            {' '} | {' '}
            <a
              href="mailto:hi@reshad.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Email
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
