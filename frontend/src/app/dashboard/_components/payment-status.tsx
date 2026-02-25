
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Clock, Ticket, Copy } from 'lucide-react';
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

                <div className="bg-muted/50 p-6 rounded-2xl border text-sm space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-lg">How to Pay (bKash)</span>
                    </div>

                    <div className="space-y-5 text-muted-foreground">
                        <p className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">1</span>
                            <span>Open bKash App and select <span className="font-bold text-foreground text-primary">"Send Money"</span></span>
                        </p>

                        <div className="space-y-3">
                            <p className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">2</span>
                                <span>Copy and send to any of these <span className="font-bold text-foreground">accounts</span>:</span>
                            </p>

                            <div className="grid grid-cols-1 gap-3 pl-9">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('01851070809');
                                        alert('Copied: 01851070809');
                                    }}
                                    className="flex items-center justify-between p-3 bg-white hover:bg-primary/5 rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all group text-left"
                                >
                                    <div>
                                        <p className="font-mono font-bold text-foreground text-base tracking-wider transition-colors group-hover:text-primary">01851070809</p>
                                        <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Atifur Rahman</p>
                                    </div>
                                    <Copy className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity text-primary" />
                                </button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('01938485079');
                                        alert('Copied: 01938485079');
                                    }}
                                    className="flex items-center justify-between p-3 bg-white hover:bg-primary/5 rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all group text-left"
                                >
                                    <div>
                                        <p className="font-mono font-bold text-foreground text-base tracking-wider transition-colors group-hover:text-primary">01938485079</p>
                                        <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Atifur Rahman Bijoy</p>
                                    </div>
                                    <Copy className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity text-primary" />
                                </button>
                            </div>
                        </div>

                        <p className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">3</span>
                            <span>Enter Amount: <span className="font-bold text-foreground text-primary">{registrationFee} TK</span></span>
                        </p>

                        <p className="flex items-start gap-3 font-semibold text-foreground">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs shadow-lg shadow-primary/30">4</span>
                            <span>Copy <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">TrxID</span> and click "Confirm My Payment" below.</span>
                        </p>
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
