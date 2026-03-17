
"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Phone } from 'lucide-react';
import { VerificationType } from '@/lib/types';

export default function ManualEntryPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const { type } = use(params) as { type: VerificationType };
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    // Prefix with PHONE- so the verify page knows to use the phone endpoint
    router.push(`/verify/PHONE-${phoneNumber}?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold font-headline text-primary">Manual Entry</h1>
      </header>

      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="text-primary w-8 h-8" />
          </div>
          <CardTitle className="font-headline">Guest Lookup</CardTitle>
          <CardDescription>
            {type === 'entrance' ? "Verify entrance status by phone number" : "Verify food entitlement by phone number"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Enter guest phone number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg h-12"
                required 
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? "Searching..." : (
                <span className="flex items-center gap-2">
                  <Search size={20} />
                  Find Guest
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Standard lookup applies for all active tickets</p>
        </CardFooter>
      </Card>
    </div>
  );
}
