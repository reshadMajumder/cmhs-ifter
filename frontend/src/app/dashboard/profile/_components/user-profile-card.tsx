
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { ProfileFormValues } from './profile-form';

interface UserProfileCardProps {
    user: Partial<ProfileFormValues>
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <>
      <CardHeader className="items-center text-center">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
          <AvatarImage src={user.profile_image} alt={user.name} />
          <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
        <CardDescription>{user.is_guest ? 'Guest' : `Batch of ${user.batch}`}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">{user.phone || 'No phone provided.'}</p>
      </CardContent>
    </>
  );
}
