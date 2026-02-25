
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

    const registrationFee = 350;

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
            <CardContent className="space-y-6">
                <div className="text-center p-6 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Registration Fee</p>
                    <p className="text-5xl font-black text-primary">{registrationFee.toLocaleString()} <span className="text-xl">TK</span></p>
                    <div className="mt-4 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full inline-block">
                        Standard Alumni Registration
                    </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl border text-sm space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <CreditCard className="h-4 w-4" />
                        <span>How to Pay (bKash)</span>
                    </div>
                    <div className="space-y-3 text-muted-foreground">
                        <p>1. Open bKash App and select <span className="font-bold text-foreground">"Send Money"</span></p>
                        <p>2. Enter Number: <span className="font-bold text-foreground">01627-076527</span></p>
                        <p>3. Enter Amount: <span className="font-bold text-foreground">{registrationFee} TK</span></p>
                        <p>4. Enter PIN and complete payment.</p>
                        <p>5. Copy TrxID and click "Confirm My Payment" below.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                        <Link href={`/dashboard/registration-payment?amount=${registrationFee}`}>
                            Confirm My Payment
                        </Link>
                    </Button>
                    <p className="text-[12px] text-red-600 font-bold text-center leading-tight">
                        Note: Wait till the payment is approved. After we check your Transaction ID and match, we will approve and your ticket will auto-generate. Until then, have patience.
                    </p>
                    <p className="text-[12px] text-red-600 font-bold text-center leading-tight mt-1">
                        দ্রষ্টব্য: পেমেন্ট অ্যাপ্রুভ না হওয়া পর্যন্ত অপেক্ষা করুন। আমরা আপনার ট্রানজেকশন আইডি চেক করে মিলিয়ে দেখার পর অ্যাপ্রুভ করব এবং আপনার টিকিট অটো জেনারেট হবে। ততক্ষণ ধৈর্য ধরুন।
                    </p>
                </div>
            </CardContent>
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
