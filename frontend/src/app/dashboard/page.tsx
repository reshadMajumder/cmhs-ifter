'use client';

import { useEffect, useState } from 'react';
import UserProfile from './_components/user-profile';
import EventStatus from './_components/event-status';
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import type { ProfileFormValues } from './profile/_components/profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import PaymentStatus from './_components/payment-status';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your reunion details.</p>
      </div>

       {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          {profileData && <UserProfile user={profileData} />}
          <EventStatus />
        </div>
        <div className="space-y-8">
          <PaymentStatus payments={payments} profile={profileData} />
        </div>
      </div>
      )}
    </div>
  );
}
