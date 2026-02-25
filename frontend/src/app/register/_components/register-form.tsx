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
import { Switch } from '@/components/ui/switch';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  profile_image: z.any().optional(),
  phone: z.string().min(11, { message: 'Please enter a valid phone number.' }),
  profession: z.string().min(2, { message: 'Profession is required.' }),
  batch: z.coerce.number().int().min(1998, 'Batch year must be 1998 or later.').max(2026, 'Batch year must be 2026 or earlier.'),
  subject: z.enum(['science', 'commerce', 'humanities', 'none'], { required_error: 'Please select your subject.' }),
  religion: z.string().optional(),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }),
  add_my_image_to_magazine: z.boolean().optional().default(false),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms.',
  }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const batchYears = Array.from({ length: 2025 - 1998 + 1 }, (_, i) => String(1998 + i)).reverse();


export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onChange',
    defaultValues: {
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

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'add_my_image_to_magazine') {
        formData.append(key, String(value));
      } else if (value) {
        formData.append(key, value);
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
        // Handle specific field errors from the API
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
                  <Input placeholder="Reshad Majumder" {...field} />
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
                  <Input placeholder="+880162xxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="batch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Year</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your batch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {batchYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Group</FormLabel>
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
                    {/* add other option */}
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="none" /></FormControl>
                      <FormLabel className="font-normal">None</FormLabel>
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
                  আমি এই মর্মে অঙ্গীকার করছি যে "কুমিল্লা মর্ডাণ হাই স্কুলের গ্র্যান্ড ইফতার মাহফিল ২০২৬” অনুষ্ঠানে বিদ্যালয়ের সকল নীতিমালা ও শৃঙ্খলা মেনে চলব এবং সেগুলোর প্রতি সর্বোচ্চ সম্মান প্রদর্শন করব।এবং আয়োজক কমিটির দিক নির্দেশনা মোতাবেক অনুষ্ঠানটিতে অংশগ্রহণ করবো।
                </FormLabel>
                {/* <FormDescription>
                  বি: দ্র:- পরিস্থিতি স্বাপেক্ষে তারিখ পরিবর্তন হতে পারে
                </FormDescription> */}
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
