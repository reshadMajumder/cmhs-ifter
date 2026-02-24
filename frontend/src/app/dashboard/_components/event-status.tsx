'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Gift, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketData {
    gift_received: boolean;
    food_received: boolean;
}

export default function EventStatus() {
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTicketStatus() {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/ticket/my-ticket/`);
                if (response.ok) {
                    const data = await response.json();
                    setTicketData(data);
                }
            } catch (error) {
                console.error("Failed to fetch ticket status:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTicketStatus();
    }, []);

    const receptionStatus = [
        {
          name: 'Lunch',
          status: ticketData?.food_received ? 'Received' : 'Pending',
          icon: <Utensils className="h-6 w-6 text-primary" />,
        },
        {
          name: 'Gift Pack',
          status: ticketData?.gift_received ? 'Received' : 'Pending',
          icon: <Gift className="h-6 w-6 text-primary" />,
        },
    ];

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Event Reception Status</CardTitle>
        <CardDescription>Updates in real-time as you collect your items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <>
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </>
        ) : (
            receptionStatus.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.name}</span>
                </div>
                <Badge variant={item.status === 'Received' ? 'default' : 'secondary'} className={cn(item.status === 'Received' && "bg-green-600 text-white")}>
                    {item.status === 'Received' ? <CheckCircle className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
                    {item.status}
                </Badge>
            </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}
