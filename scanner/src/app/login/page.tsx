
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogIn } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login(phone, password);
      toast({
        title: "Login Successful",
        description: "Welcome back to EventPass Verify.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid phone number or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">EventPass Verify</h1>
          <p className="text-muted-foreground">Staff Portal Authentication</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Login</CardTitle>
            <CardDescription>Enter your credentials to access the scanner dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="text" 
                  placeholder="e.g. 1" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Authenticating..." : (
                  <span className="flex items-center gap-2">
                    <LogIn size={20} />
                    Sign In
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">Authorized personnel only</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
