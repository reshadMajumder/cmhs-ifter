
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Upload, Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_BASE_URL } from '@/lib/constants';

const guestRegisterFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  profile_image: z.any().refine(file => file, 'Profile image is required.'),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().min(2, { message: 'Profession is required.' }),
  religion: z.string().optional(),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }),
  t_shirt_size: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { required_error: 'Please select your T-shirt size.' }),
  is_guest: z.boolean().default(true),
  add_my_image_to_magazine: z.boolean().optional().default(false),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms.',
  }),
});

type GuestRegisterFormValues = z.infer<typeof guestRegisterFormSchema>;

const tshirtSizes = [
    { size: 'S', chest: '38"', length: '27"' },
    { size: 'M', chest: '40"', length: '28"' },
    { size: 'L', chest: '42"', length: '29"' },
    { size: 'XL', chest: '44"', length: '30"' },
    { size: 'XXL', chest: '46"', length: '31"' },
];

export default function GuestRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<GuestRegisterFormValues>({
    resolver: zodResolver(guestRegisterFormSchema),
    mode: 'onChange',
    defaultValues: {
        is_guest: true,
        add_my_image_to_magazine: false,
    }
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('profile_image', file);
    }
  }

  async function onSubmit(data: GuestRegisterFormValues) {
    setIsLoading(true);
    
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'is_guest' || key === 'add_my_image_to_magazine') {
            formData.append(key, String(value));
        } else if (value) {
            formData.append(key, value as string | Blob);
        }
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            toast({
                title: 'Registration Successful',
                description: "You can now log in with your credentials.",
            });
            router.push('/login');
        } else {
            const errorMessages = Object.entries(result).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n');
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: errorMessages || 'An unexpected error occurred. Please try again.',
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request. Please check your connection.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="profile_image"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel>
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="mx-auto h-8 w-8" />
                      <span className="text-xs">Upload Photo</span>
                    </div>
                  )}
                </div>
              </FormLabel>
              <FormControl>
                <Input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                  <Input placeholder="+880123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
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
                    className="flex space-x-4"
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
        
        <FormField
          control={form.control}
          name="add_my_image_to_magazine"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Add my image to the magazine
                </FormLabel>
                <FormDescription>
                  I agree to have my profile image featured in the official reunion magazine.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agree"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  আমি এই মর্মে অঙ্গীকার করছি যে “রানীর বাজার মাধ্যমিক বিদ্যালয় গ্র্যান্ড রিইউনিয়ন ২০২৬” অনুষ্ঠানে বিদ্যালয়ের সকল নীতিমালা ও শৃঙ্খলা মেনে চলব এবং সেগুলোর প্রতি সর্বোচ্চ সম্মান প্রদর্শন করব।
                </FormLabel>
                <FormDescription>
                  বি: দ্র:- পরিস্থিতি স্বাপেক্ষে তারিখ পরিবর্তন হতে পারে
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Guest Account'}
        </Button>
      </form>
    </Form>
  );
}
