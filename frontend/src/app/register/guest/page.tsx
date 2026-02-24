
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import GuestRegisterForm from './_components/guest-register-form';

export default function GuestRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline">Guest Registration</CardTitle>
          <CardDescription>Register as a guest for the RBMB Grand Reunion 2026.</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestRegisterForm />
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Are you an alumnus?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
