'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DonationForm() {
    const [amount, setAmount] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleProceedToPayment = () => {
        if (!amount || Number(amount) <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid donation amount.',
            });
            return;
        }
        router.push(`/dashboard/payment?amount=${amount}&type=donation`);
    }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">Enter Amount (tk)</label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    id="amount"
                    type="number"
                    placeholder="5000"
                    className="pl-10 text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
        </div>
         <div className="grid grid-cols-2 gap-2">
            {[1000, 2000, 5000, 10000].map(val => (
                 <Button key={val} variant="outline" className="flex-1" onClick={() => setAmount(String(val))}>
                    {val.toLocaleString()}tk
                 </Button>
            ))}
        </div>
        <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleProceedToPayment}>
            <CreditCard className="mr-2 h-5 w-5" />
            Proceed to Payment
        </Button>
        {/* payment closed message btn || if open then uncomment avobe and comment this bellow */}
        {/* <Button disabled className="w-full cursor-not-allowed">
          Proceed to Payment
        </Button> */}
    </div>
  );
}
