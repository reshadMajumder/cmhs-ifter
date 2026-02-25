
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    phone: z.string().optional(),
    profession: z.string().min(2, { message: 'Profession is required.' }),
    batch: z.coerce.number().int().min(1980, 'Invalid batch year.').max(new Date().getFullYear(), 'Invalid batch year.').optional(),
    subject: z.enum(['science', 'commerce', 'humanities']).optional(),
    religion: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    profile_image: z.any().optional(),
    add_my_image_to_magazine: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;



interface ProfileFormProps {
    defaultValues: Partial<ProfileFormValues>;
}

export default function ProfileForm({ defaultValues }: ProfileFormProps) {
    const { toast } = useToast();
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
        mode: 'onChange',
    });

    const { formState: { dirtyFields, isSubmitting } } = form;

    async function onSubmit(data: ProfileFormValues) {
        const changedData: Partial<ProfileFormValues> = {};

        // Only include dirty fields in the submission data
        for (const key in dirtyFields) {
            if (key in data) {
                (changedData as any)[key] = (data as any)[key];
            }
        }

        // If no fields have changed, don't submit.
        if (Object.keys(changedData).length === 0) {
            toast({
                title: 'No changes to save',
                description: 'You haven\'t made any changes to your profile.',
            });
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/accounts/profile/`, {
                method: 'PUT',
                body: JSON.stringify(changedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update profile.');
            }

            toast({
                title: 'Profile Updated!',
                description: 'Your changes have been saved successfully.',
            });
            form.reset(data); // Reset form state with new data to clear dirty fields

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+880123456789" {...field} disabled />
                                </FormControl>
                                <FormDescription>Your phone number cannot be changed.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="batch"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Batch Year</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 2005" {...field} disabled />
                            </FormControl>
                            <FormDescription>Your batch year cannot be changed.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profession</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="science" /></FormControl>
                                            <FormLabel className="font-normal">Science</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="commerce" /></FormControl>
                                            <FormLabel className="font-normal">Commerce</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="humanities" /></FormControl>
                                            <FormLabel className="font-normal">Humanities</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="male" /></FormControl>
                                            <FormLabel className="font-normal">Male</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="female" /></FormControl>
                                            <FormLabel className="font-normal">Female</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="other" /></FormControl>
                                            <FormLabel className="font-normal">Other</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Religion</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your religion" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="islam">Islam</SelectItem>
                                        <SelectItem value="hinduism">Hinduism</SelectItem>
                                        <SelectItem value="buddhism">Buddhism</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="add_my_image_to_magazine"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-full">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Magazine Image?
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                        Featured in the reunion magazine.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Update Profile'}
                </Button>
            </form>
        </Form>
    );
}
