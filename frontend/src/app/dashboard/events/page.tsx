
'use client';

import { useState, useEffect, useRef } from 'react';
import TicketCard from "./_components/ticket-card";
import { Button } from "@/components/ui/button";
import { Download, Ticket } from "lucide-react";
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface User {
    name: string;
}

interface TicketData {
    user: User;
    ticket_code: string;
    has_donation: boolean;
    guests: number;
    children: number;
    ticket_type: 'Senior' | 'Junior' | 'Guest';
}

export default function EventsPage() {
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchTicket() {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/ticket/my-ticket/`);
                if (response.status === 404) {
                    setError("No ticket found for this user. Please complete your registration payment.");
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket data.');
                }
                const data = await response.json();
                setTicketData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTicket();
    }, []);

    const handleDownload = () => {
        if (ticketRef.current) {
            html2canvas(ticketRef.current, { 
                useCORS: true,
                backgroundColor: null // Make background transparent
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'reunion-ticket.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const getTicketTypeForCard = (type: 'Senior' | 'Junior' | 'Guest') => {
        if (type === 'Senior') return 'Vintage RBMBIAN';
        if (type === 'Junior') return 'New Generation';
        return 'Golden Era'; // Fallback for Guest or other types
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Event Ticket</h1>
                <p className="text-muted-foreground">
                    This is your official ticket for the reunion. You can download it or show this screen at the event.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center">
                    <Skeleton className="h-[400px] w-full max-w-4xl" />
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertTitle>Ticket Not Found</AlertTitle>
                    <AlertDescription>
                        {error}
                        <Button asChild className="mt-4">
                            <Link href="/dashboard">Return to Dashboard to Pay</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : ticketData ? (
                 <div className="space-y-8">
                    <div className="flex justify-center">
                        <TicketCard 
                            ref={ticketRef}
                            alumniName={ticketData.user.name}
                            ticketType={getTicketTypeForCard(ticketData.ticket_type)}
                            guestCount={ticketData.guests}
                            childCount={ticketData.children}
                            secretCode={ticketData.ticket_code}
                            isDonator={ticketData.has_donation}
                        />
                    </div>
                    <div className="text-center mt-6">
                        <Button onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5" />
                            Download Ticket
                        </Button>
                    </div>
                </div>
            ) : null}
      </div>
    )
}
