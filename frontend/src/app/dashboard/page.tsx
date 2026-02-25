'use client';

import { useEffect, useState } from 'react';
import EventStatus from './_components/event-status';
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import type { ProfileFormValues } from './profile/_components/profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import PaymentStatus from './_components/payment-status';
import UserProfile from './_components/user-profile';
import TransactionHistory from './donate/_components/transaction-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

interface Payment {
  id: number;
  payment_type: string;
  payment_approved: boolean;
}

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [profileResponse, paymentResponse] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/api/accounts/profile/`),
          fetchWithAuth(`${API_BASE_URL}/api/payment/get-create/`),
        ]);

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profile = await profileResponse.json();
        setProfileData(profile);

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPayments(paymentData);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      {!isLoading && profileData && (
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-accent/5 rounded-2xl border border-accent/10">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 overflow-hidden shadow-xl">
              <img
                src={profileData.profile_image || 'https://github.com/shadcn.png'}
                alt={profileData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              Batch {profileData.batch}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-foreground">
              Hello{profileData.name ? <>, <span className="text-primary">{profileData.name.split(' ')[0]}</span></> : ''}!
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Welcome back to your CMHS Grand Iftar Dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Priority: Payment Status */}
            <div className="order-first">
              <PaymentStatus payments={payments} profile={profileData} />
            </div>

            {/* Person & Event Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {profileData && <UserProfile user={profileData} />}
              <EventStatus />
            </div>

            {/* Support Info Card */}
            <div className="p-6 bg-card rounded-xl border shadow-sm border-dashed border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Need Support?</h3>
                  <p className="text-sm text-muted-foreground">
                    Having trouble with registration or payment? Contact our team.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase">Mitul</span>
                    <a href="tel:+8801719454545" className="text-sm font-semibold hover:underline">01719454545</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase">Shad</span>
                    <a href="tel:+8801401165474" className="text-sm font-semibold hover:underline">01401165474</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase">Rohan</span>
                    <a href="tel:+8801754658253" className="text-sm font-semibold hover:underline">01754658253</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <Card className="mt-8 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your recent payments and donations for the reunion event.</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
