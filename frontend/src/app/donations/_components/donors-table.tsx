
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Donation, getDonations } from '@/lib/donations-service';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function DonorsTable() {
    const [donations, setDonations] = React.useState<Donation[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
    
    React.useEffect(() => {
        async function fetchData() {
            try {
                const data = await getDonations();
                setDonations(data.donations);
            } catch (error) {
                console.error("Failed to fetch donations", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const sortedDonations = React.useMemo(() => {
        const sorted = [...donations].sort((a, b) => {
            const amountA = Number(a.amount);
            const amountB = Number(b.amount);
            if (sortOrder === 'asc') {
                return amountA - amountB;
            }
            return amountB - amountA;
        });
        return sorted;
    }, [donations, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }
    
    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <p className="text-lg text-muted-foreground">Be the first to contribute!</p>
                <Button asChild>
                    <Link href="/dashboard/donate">
                        <Heart className="mr-2 h-4 w-4" />
                        Donate Now
                    </Link>
                </Button>
            </div>
        )
    }


    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead className="text-right">
                           <Button variant="ghost" onClick={toggleSortOrder}>
                                Amount
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedDonations.map((donation, index) => (
                    <TableRow key={donation.transaction_id + index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={donation.image || undefined} alt={donation.name} />
                                    <AvatarFallback>{donation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{donation.name}</span>
                                    {donation.isFeatured && <Badge variant="default" className="w-fit bg-amber-500 text-white">Top Donor</Badge>}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{donation.batch}</TableCell>
                        <TableCell className="text-right font-semibold">{Number(donation.amount).toLocaleString()}tk</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
