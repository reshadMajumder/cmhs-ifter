
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constants';
import { fetchWithAuth } from '@/lib/api';
import { CopyableText } from '@/components/copyable-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const paymentSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required.'),
  method: z.literal('bkash', {
    errorMap: () => ({ message: "Please select bKash as the payment method." }),
  }),
  phone: z.string().min(1, 'Phone number is required.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function RegistrationPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const amount = searchParams.get('amount');
  const paymentType = 'registration';

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        method: 'bkash'
    }
  });

  async function onSubmit(data: PaymentFormValues) {
    if (!amount) {
        toast({ variant: 'destructive', title: 'Error', description: 'Amount is missing.' });
        return;
    }

    const paymentData = {
        ...data,
        amount,
        payment_type: paymentType,
    };

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/payment/get-create/`, {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit payment.');
        }

        toast({
            title: 'Payment Submitted',
            description: 'Your payment is being processed. You will be redirected shortly.',
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    }
  }

  if (!amount) {
      return (
          <div className="text-center py-12">
              <p className="text-lg text-destructive">Invalid payment amount.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                  Return to Dashboard
              </Button>
          </div>
      )
  }

  return (
    <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <CardTitle>Complete Registration Payment</CardTitle>
                <div className="py-4">
                  <p className="text-lg">Your registration fee is:</p>
                  <p className="text-5xl font-bold text-primary my-2">{Number(amount).toLocaleString()}tk</p>
                </div>
                 <Alert variant="destructive" className="text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>গুরুত্বপূর্ণ নোটিশ</AlertTitle>
                  <AlertDescription>
                   আপনি নিবন্ধনের জন্য শুধুমাত্র একবার অর্থ প্রদান করতে পারবেন। আপনি যদি সঠিক পরিমাণ অর্থ প্রদান না করেন তবে আপনার অর্থপ্রদান গৃহীত হবে না।
                  </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <Image 
                        src="https://res.cloudinary.com/dxz64hu1o/image/upload/v1761978329/bkash-payment-instruction_ahugej.png"
                        alt="bKash Payment Instructions"
                        width={1080}
                        height={1920}
                        className="w-full h-auto rounded-lg border shadow-md"
                    />
                     <p className="text-xs text-muted-foreground text-center mt-2">Tap and hold to zoom</p>
                </div>
                <div className="mb-6 p-4 bg-muted rounded-lg text-sm space-y-4">
                    <p className="font-bold">Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-3">
                        <li>Open your bKash App and select "Make Payment".</li>
                        <li>
                            <span >Enter the Merchant number:</span>
                            <CopyableText text="+8801617895466" />
                        </li>
                         <li>
                            <span >Enter the amount:</span> <span className="font-bold text-bkash">{Number(amount).toLocaleString()}tk</span>
                        </li>
                         <li>
                            <span >Enter reference:</span>
                            <CopyableText text="reunion2026" />
                        </li>
                        <li>Complete the payment and copy the Transaction ID (TrxID).</li>
                    </ol>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Your bKash Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="The number you paid from" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a payment method" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="transaction_id"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Transaction ID (TrxID)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the TrxID from your bKash message" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Payment'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}


export default function RegistrationPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegistrationPaymentPageContent />
        </Suspense>
    )
}
