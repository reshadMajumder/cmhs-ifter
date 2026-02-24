
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, Star } from 'lucide-react';
import Link from 'next/link';

interface RegisteredEventsProps {
    hasDonation: boolean;
}

export default function RegisteredEvents({ hasDonation }: RegisteredEventsProps) {
  const event = {
    name: 'RBMB Grand Reunion 2026',
    date: 'March 23, 2026',
    tier: hasDonation ? 'Valued Contributor' : 'Alumni',
    paymentStatus: 'Paid',
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>My Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 border rounded-lg">
          <div>
            <h3 className="font-bold text-lg">{event.name}</h3>
            <p className="text-sm text-muted-foreground">{event.date}</p>
          </div>
          <div className="text-right">
             <div className="font-semibold flex items-center gap-2 justify-end">
                {hasDonation && <Star className="h-4 w-4 text-amber-500" />}
                <p>{event.tier}</p>
            </div>
            <p className="text-sm text-green-600 font-bold">{event.paymentStatus}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-background">
          <h4 className="font-bold mb-2">What's Included:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Full Access to All Reunion Events</li>
            <li>Grand Gala Dinner</li>
            <li>Exclusive Souvenir Kit</li>
            <li>Alumni Network Directory</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href="/dashboard/events">
            <Ticket className="mr-2 h-4 w-4" />
            View Ticket
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
