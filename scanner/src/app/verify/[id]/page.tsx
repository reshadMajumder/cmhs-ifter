"use client";

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Home, User, Ticket, Briefcase, GraduationCap, Phone, QrCode, Loader2, Utensils, LogIn } from 'lucide-react';
import { TicketResult, VerificationType, ApiResponse } from '@/lib/types';
import { authService } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { id } = use(params);
  
  const typeParam = searchParams.get('type');
  const type = (typeParam === 'food' ? 'food' : 'entrance') as VerificationType;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActionSuccess, setIsActionSuccess] = useState(false);
  
  const hasProcessed = useRef(false);

  const performVerification = useCallback(async () => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    try {
      setLoading(true);
      
      let data: ApiResponse;
      
      // Handle phone lookup vs ticket code lookup
      if (id.startsWith('PHONE-')) {
        const phoneNumber = id.replace('PHONE-', '');
        if (type === 'food') {
          data = await authService.markFoodReceivedByPhone(phoneNumber);
          setIsActionSuccess(true);
        } else {
          data = await authService.checkEntranceByPhone(phoneNumber);
        }
      } else if (type === 'food') {
        data = await authService.markFoodReceived(id);
        setIsActionSuccess(true);
      } else {
        data = await authService.checkEntrance(id);
      }
      
      if (data.ticket) {
        const transformed: TicketResult = {
          id: data.ticket.ticket_code,
          guestName: data.ticket.user.name,
          phone: data.ticket.user.phone,
          status: data.status === 'valid' ? 'valid' : 'invalid',
          ticketType: `Batch ${data.ticket.user.batch} - ${data.ticket.user.profession}`,
          details: {
            batch: data.ticket.user.batch,
            profession: data.ticket.user.profession,
            subject: data.ticket.user.subject,
            profileImage: data.ticket.user.profile_image,
          },
          foodReceived: data.ticket.food_received,
          timestamp: new Date().toLocaleTimeString(),
        };
        setResult(transformed);
      } else {
        setErrorMessage(data.message || "Invalid Ticket Response");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Network Error");
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [id, type, toast]);

  useEffect(() => {
    performVerification();
  }, [performVerification]);

  const handleScanAnother = () => {
    router.push(id.startsWith('PHONE-') ? `/manual/${type}` : `/scan/${type}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-medium text-muted-foreground animate-pulse text-sm">
            {id.startsWith('PHONE-') ? 'Looking up Guest...' : type === 'food' ? 'Processing Service...' : 'Verifying Ticket...'}
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center space-y-6">
        <XCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-xl font-bold font-headline text-destructive">Error</h2>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <div className="w-full space-y-3">
          <Button onClick={handleScanAnother} className="w-full h-12 rounded-xl">
            {id.startsWith('PHONE-') ? 'Try Another Phone' : 'Try Another Scan'}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-12 text-xs">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isActionSuccess && result && type === 'food') {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-headline text-accent leading-tight">Food Marked Served</h2>
          <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 space-y-2 max-w-[280px] mx-auto">
            <Avatar className="w-14 h-14 mx-auto border-2 border-accent/20">
              <AvatarImage src={result.details.profileImage || ''} />
              <AvatarFallback className="bg-accent/10 text-accent text-lg font-bold">
                {result.guestName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-black text-foreground leading-tight">{result.guestName}</p>
          </div>
        </div>
        <div className="w-full space-y-2 pt-2">
          <Button onClick={handleScanAnother} className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-2xl">
            {id.startsWith('PHONE-') ? 'Look up Next' : 'Scan Next Guest'}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-8 rounded-xl text-muted-foreground text-[10px]">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.status === 'valid';
  const isUsed = result.status === 'used';
  
  const pageTitle = type === 'entrance' ? 'Entrance Verification' : 'Food Verification';
  const successMessage = type === 'entrance' ? 'Entry Authorized' : 'Authorized';

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 max-w-md mx-auto animate-in fade-in duration-500">
      <header className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full h-8 w-8">
          <Home size={18} />
        </Button>
        <h1 className="text-lg font-bold font-headline text-primary">{pageTitle}</h1>
      </header>

      <Card className={`border-2 overflow-hidden shadow-md ${
        isSuccess && !isUsed ? 'border-primary/30' : 
        isUsed ? 'border-amber-400/30' : 
        'border-destructive/30'
      }`}>
        <div className={`p-4 text-center ${
          isSuccess && !isUsed ? 'bg-primary/5' : 
          isUsed ? 'bg-amber-400/5' : 
          'bg-destructive/5'
        }`}>
          <div className="mb-2 flex justify-center">
            {isSuccess && !isUsed && <CheckCircle2 className="w-12 h-12 text-primary" />}
            {isUsed && <AlertCircle className="w-12 h-12 text-amber-500" />}
            {result.status === 'invalid' && <XCircle className="w-12 h-12 text-destructive" />}
          </div>
          <h2 className={`text-xl font-bold font-headline ${
            isSuccess && !isUsed ? 'text-primary' : 
            isUsed ? 'text-amber-600' : 
            'text-destructive'
          }`}>
            {isSuccess && !isUsed ? successMessage : isUsed ? "Already Used" : "Invalid"}
          </h2>
          <p className="text-muted-foreground text-[9px] mt-0.5">{result.timestamp}</p>
        </div>

        <CardContent className="pt-3 pb-3 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/40">
            <Avatar className="w-12 h-12 border border-primary/20">
              <AvatarImage src={result.details.profileImage || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {result.guestName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0 min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Guest Identity</p>
              <h3 className="text-base font-bold font-headline tracking-tight leading-tight truncate">{result.guestName}</h3>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <Phone size={10} className="text-primary/60" />
                {result.phone}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-card border rounded-lg flex flex-col gap-0.5">
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Batch</p>
              <p className="text-xs font-bold">{result.details.batch}</p>
            </div>
            <div className="p-2 bg-card border rounded-lg flex flex-col gap-0.5">
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Profession</p>
              <p className="text-xs font-bold truncate">{result.details.profession}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-secondary/10 rounded-lg border border-dashed">
            <Ticket className="text-primary mt-0.5 shrink-0" size={14} />
            <div className="space-y-0.5">
              <p className="text-[8px] text-muted-foreground uppercase font-bold">Ticket Code</p>
              <p className="text-sm font-bold font-mono text-primary leading-none">{result.id}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          <Button 
            onClick={handleScanAnother} 
            className="w-full h-12 text-lg font-bold shadow-md rounded-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 shadow-primary/20 flex items-center justify-center gap-2"
          >
            {id.startsWith('PHONE-') ? <Phone size={18} /> : <QrCode size={18} />}
            {id.startsWith('PHONE-') ? 'Next Phone Lookup' : 'Scan Next Guest'}
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')} 
            className="w-full h-8 text-muted-foreground rounded-xl text-[10px]"
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}