
'use client';

import * as React from "react"
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, Heart, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Donation, getDonations } from "@/lib/donations-service";
import { Skeleton } from "@/components/ui/skeleton";


export default function Donations() {
    const [donations, setDonations] = React.useState<Donation[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

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

    if (isLoading) {
        return (
            <section className="py-12 md:py-20 bg-background/80 w-full overflow-hidden">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-48 w-72 mx-4" />
                    <Skeleton className="h-48 w-72 mx-4 hidden md:block" />
                    <Skeleton className="h-48 w-72 mx-4 hidden lg:block" />
                </div>
            </section>
        )
    }

  return (
    <section className="py-12 md:py-20 bg-background/80 w-full overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
            <Handshake className="h-8 w-8 md:h-10 md:w-10 text-accent" />
            RBMBIAN Contributions
          </h2>
          <p className="text-md md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Generous donations from our RBMBIANs are making this event possible.
          </p>
        </div>
        
        {donations.length === 0 ? (
            <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">Be the first to contribute and make a difference!</p>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-shadow" asChild>
                    <Link href="/dashboard/donate">
                        <Heart className="mr-2 h-5 w-5" />
                        Donate Now
                    </Link>
                </Button>

                {/* donation closed message btn || if open then uncomment avobe and comment this bellow */}
                {/* <div className="text-center mt-12">
                    <Button disabled className="w-full max-w-xs cursor-not-allowed">
                      Donation Closed
                    </Button>
                </div> */}
            </div>
        ) : (
            <>
                <div className="marquee">
                    <div className="marquee-content">
                        {[...donations, ...donations].map((donation, index) => (
                            <Card key={index} className={cn("flex-shrink-0 w-72 mx-4 shadow-lg hover:shadow-2xl transition-all duration-300", donation.isFeatured && "border-accent border-2 shadow-purple-200")}>
                                <CardHeader className="items-center text-center relative pt-4 pb-2">
                                    <Avatar className="h-16 w-16 mb-2 border-2 border-primary/50">
                                        <AvatarImage src={donation.image || undefined} alt={donation.name} />
                                        <AvatarFallback>{donation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {donation.isFeatured && <div className="absolute top-0 right-0 p-2 text-white bg-accent rounded-bl-lg rounded-tr-lg"><Heart className="h-5 w-5"/></div>}
                                    <CardTitle className="font-headline text-xl">{donation.name}</CardTitle>
                                    <CardDescription className="text-sm">Batch of {donation.batch}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow text-center flex flex-col justify-center items-center p-4">
                                    <p className="text-3xl font-bold text-primary">{Number(donation.amount).toLocaleString()}tk</p>
                                    <p className="text-sm text-muted-foreground">Donated</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12 flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-shadow" asChild>
                        <Link href="/dashboard/donate">
                            <Heart className="mr-2 h-5 w-5" />
                            Donate Now
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-shadow" asChild>
                        <Link href="/donations">
                            <List className="mr-2 h-5 w-5" />
                            View Full List
                        </Link>
                    </Button>
                </div>
            </>
        )}
    </section>
  );
}
