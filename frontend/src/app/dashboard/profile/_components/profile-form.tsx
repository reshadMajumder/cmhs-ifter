
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { fetchWithAuth } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  profession: z.string().min(2, { message: 'Profession is required.' }),
  batch: z.coerce.number().int().min(1980, 'Invalid batch year.').max(new Date().getFullYear(), 'Invalid batch year.').optional(),
  subject: z.enum(['science', 'commerce', 'humanities']).optional(),
  religion: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  t_shirt_size: z.enum(['S', 'M', 'L', 'XL', 'XXL']).optional(),
  profile_image: z.any().optional(),
  is_guest: z.boolean().optional(),
  add_my_image_to_magazine: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const tshirtSizes = [
    { size: 'S', chest: '38"', length: '27"' },
    { size: 'M', chest: '40"', length: '28"' },
    { size: 'L', chest: '42"', length: '29"' },
    { size: 'XL', chest: '44"', length: '30"' },
    { size: 'XXL', chest: '46"', length: '31"' },
];

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
  const isGuest = defaultValues.is_guest;

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
        
        {!isGuest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="bloodGroup"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., O+" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        )}
        
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
            {!isGuest && (
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
            )}
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
                name="t_shirt_size"
                render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                    <FormLabel>T-Shirt Size</FormLabel>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                                <Ruler className="mr-1 h-3 w-3"/>
                                View Size Guide
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>T-Shirt Size Guide</DialogTitle>
                                <DialogDescription>All measurements are in inches.</DialogDescription>
                            </DialogHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Chest</TableHead>
                                        <TableHead>Length</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tshirtSizes.map((s) => (
                                        <TableRow key={s.size}>
                                            <TableCell className="font-medium">{s.size}</TableCell>
                                            <TableCell>{s.chest}</TableCell>
                                            <TableCell>{s.length}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </DialogContent>
                    </Dialog>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your size" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="S">S (Small)</SelectItem>
                        <SelectItem value="M">M (Medium)</SelectItem>
                        <SelectItem value="L">L (Large)</SelectItem>
                        <SelectItem value="XL">XL (Extra Large)</SelectItem>
                        <SelectItem value="XXL">XXL (Double Extra Large)</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <FormLabel className="text-base">
                Status
                </FormLabel>
                <FormDescription>
                This was set during registration and cannot be changed.
                </FormDescription>
            </div>
            <p className="text-sm font-medium">{defaultValues.is_guest ? 'Guest' : 'Alumni'}</p>
        </FormItem>

        
        <FormField
          control={form.control}
          name="add_my_image_to_magazine"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
               <div className="space-y-0.5">
                    <FormLabel className="text-base">
                    Add image to magazine?
                    </FormLabel>
                    <FormDescription>
                    Allow your profile image to be featured in the reunion magazine.
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
        
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
}
