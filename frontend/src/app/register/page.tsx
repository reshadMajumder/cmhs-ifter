import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import RegisterForm from './_components/register-form';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MatrixRain from '@/components/matrix-rain';
import Loader from '@/components/loader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const parallaxImage = PlaceHolderImages.find(p => p.id === 'parallax-bg');

  return (
    <>
      <Loader />
      <div className="relative z-10 bg-background">
        <Header />
        <main className="relative">
          {/* Parallax Background */}
          {parallaxImage && (
            <div className="fixed inset-0 h-screen w-full -z-10 overflow-hidden">
              <Image
                src={parallaxImage.imageUrl}
                alt={parallaxImage.description}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]"></div>
            </div>
          )}

          <div className="flex min-h-screen items-center justify-center p-4 py-32 relative z-10">
            <Card className="w-full max-w-2xl shadow-2xl bg-blue-100/95 backdrop-blur-md border border-blue-200/50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Logo className="h-16 w-16" />
                </div>
                <CardTitle className="text-3xl font-headline tracking-tight text-primary">Create Your Account</CardTitle>
                <CardDescription className="text-muted-foreground/80">Join the CMHSIAN network and register for the event.</CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
              <CardFooter>
                <p className="w-full text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
                    Login here
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
      <MatrixRain />
    </>
  );
}

