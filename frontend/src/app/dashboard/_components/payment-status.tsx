
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Clock, Ticket } from 'lucide-react';
import type { ProfileFormValues } from '../profile/_components/profile-form';

interface Payment {
  id: number;
  payment_type: string;
  payment_approved: boolean;
}

interface PaymentStatusProps {
    payments: Payment[];
    profile: Partial<ProfileFormValues> | null;
}

export default function PaymentStatus({ payments, profile }: PaymentStatusProps) {
  const registrationPayment = payments.find(p => p.payment_type === 'registration');
  
  const getRegistrationFee = () => {
    if (!profile) return 1500 + 30; // Default fee

    if (profile.is_guest) {
        return 800 + 20;
    }
    
    if (profile.batch) {
        return profile.batch >= 2017 ? 1000 + 20 : 1500 + 30;
    }

    return 1500 + 30; // Default for alumni if batch is somehow missing
  };
  const registrationFee = getRegistrationFee();

  const renderStatus = () => {
    if (registrationPayment) {
        if (registrationPayment.payment_approved) {
            return (
                <>
                    <CardContent>
                        <div className="flex items-center justify-center p-6 bg-green-50 text-green-800 rounded-lg">
                            <CheckCircle2 className="h-8 w-8 mr-4" />
                            <div>
                                <p className="font-bold text-lg">Payment Confirmed</p>
                                <p className="text-sm">Thank you for registering! Your ticket is now available.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button asChild>
                            <Link href="/dashboard/events">
                                <Ticket className="mr-2 h-4 w-4" />
                                View Ticket
                            </Link>
                        </Button>
                    </CardFooter>
                </>
            );
        } else {
             return (
                <CardContent>
                    <div className="flex items-center justify-center p-6 bg-yellow-50 text-yellow-800 rounded-lg">
                        <Clock className="h-8 w-8 mr-4" />
                        <div>
                            <p className="font-bold text-lg">Payment Pending</p>
                            <p className="text-sm">Your payment is awaiting approval. Please check back later.</p>
                        </div>
                    </div>
                </CardContent>
            );
        }
    }

    // No registration payment found
    return (
        <>
            <CardContent>
                <div className="text-center">
                    <p className="text-lg">Your registration fee is:</p>
                    <p className="text-4xl font-bold text-primary my-2">{registrationFee.toLocaleString()}tk</p>
                    <p className="text-muted-foreground text-sm">
                        {profile?.is_guest ? '(Guest)' : (profile?.batch && (profile.batch >= 2017 ? '(Junior RBMBIAN)' : '(Senior RBMBIAN)'))}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="justify-center">
                <Button asChild size="lg">
                    <Link href={`/dashboard/registration-payment?amount=${registrationFee}`}>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now
                    </Link>
                </Button>
                {/* payment closed message btn || if open then uncomment avobe and comment this bellow */}
                {/* <Button disabled className="w-full max-w-xs cursor-not-allowed">
                  Payment Closed
                </Button> */}
            </CardFooter>
        </>
    );
  }

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Registration Payment</CardTitle>
        <CardDescription>
            {registrationPayment?.payment_approved ? "Your payment for the reunion has been confirmed." : "Your registration payment status."}
        </CardDescription>
      </CardHeader>
      {renderStatus()}
    </Card>
  );
}
