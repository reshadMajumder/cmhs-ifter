'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm, { type ProfileFormValues } from './_components/profile-form';
import UserProfileCard from './_components/user-profile-card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/accounts/profile/`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader className="items-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-8 w-32 mt-4" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </CardHeader>
                        <CardContent className="text-center">
                            <Skeleton className="h-4 w-40 mx-auto" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center text-center p-4">
            {profileData && <UserProfileCard user={profileData} />}
            <Button variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                    This information will be displayed on your public profile.
                </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileData && <ProfileForm defaultValues={profileData} />}
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
