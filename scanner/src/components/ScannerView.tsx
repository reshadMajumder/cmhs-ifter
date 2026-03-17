"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, XCircle, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ScannerViewProps {
  onScan: (decodedText: string) => void;
  title: string;
}

export default function ScannerView({ onScan, title }: ScannerViewProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);
  const containerId = "qr-reader-container";
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        // 1. Initial Permission Check to avoid AbortError on fast mounts
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        setHasCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());

        // 2. Initialize the instance
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            // Check mounted status before proceeding with scan success
            if (!isMounted.current || isStopping) return;
            
            setIsStopping(true);
            
            // CRITICAL: We MUST stop the scanner and wait for cleanup BEFORE
            // triggering the navigation callback to prevent removeChild errors
            try {
              if (html5QrCode?.isScanning) {
                await html5QrCode.stop();
              }
            } catch (e) {
              // Silently handle cases where stop might fail if DOM already unmounting
              console.warn("Scanner stop failed during cleanup", e);
            }
            
            if (isMounted.current) {
              onScan(decodedText);
            }
          },
          () => {
            // Silently handle frame-by-frame errors (common when focusing)
          }
        );

        if (isMounted.current) setIsReady(true);
      } catch (err: any) {
        if (!isMounted.current) return;
        
        // Handle expected interruption during navigation/re-render
        if (err.name === 'AbortError') {
          console.log('Scanner play() request interrupted (expected)');
          return;
        }

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setHasCameraPermission(false);
        } else {
          setError(err.message || "Could not start camera");
        }
      }
    };

    // Small delay ensures DOM container is stable in Next.js/React hydration
    const timer = setTimeout(startScanner, 200);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      
      // Cleanup the scanner instance on unmount
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((e) => {
          // This is often where the removeChild error originates if not handled
          console.warn("Unmount cleanup warning", e);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50 text-white select-none overflow-hidden">
      {/* Header */}
      <header className="pt-[env(safe-area-inset-top)] bg-zinc-900/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="text-white hover:bg-white/10 rounded-full h-10 w-10"
          disabled={isStopping}
        >
          <ArrowLeft size={22} />
        </Button>
        <div className="text-center">
          <h2 className="font-bold text-base tracking-tight">{title}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isReady && !isStopping ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
            )} />
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
              {isStopping ? 'Validating...' : isReady ? 'Live View' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="w-10" />
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-full max-w-[320px] aspect-square">
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl" />
            
            {isReady && !isStopping && (
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-primary/40 animate-pulse" />
            )}
          </div>

          {/* Actual Scanner Container - Key ensures stable re-mounts */}
          <div 
            key="scanner-element"
            id={containerId} 
            className={cn(
              "w-full h-full rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center transition-all duration-300",
              isReady ? 'opacity-100' : 'opacity-20',
              "[&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:rounded-2xl [&_canvas]:hidden"
            )}
          />

          {!isReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-zinc-500 text-xs font-medium">Camera starting...</p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-10 w-full max-w-xs space-y-4">
          {hasCameraPermission === false && (
             <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-white">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription className="text-xs text-zinc-300">
                Please enable camera permissions in settings to scan.
              </AlertDescription>
            </Alert>
          )}

          {!isStopping && isReady && (
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
              <Info size={16} className="text-primary shrink-0" />
              <p className="text-[11px] text-zinc-300 font-medium leading-tight">
                Align the guest's QR code within the square frame.
              </p>
            </div>
          )}

          {error && !isStopping && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-[10px] text-destructive font-bold uppercase tracking-wide">Error: {error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-10 p-6 flex flex-col items-center bg-gradient-to-t from-black to-transparent">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="w-full max-w-[240px] rounded-full bg-white/5 text-white border-white/10 hover:bg-white/15 h-11 text-xs font-bold"
          disabled={isStopping}
        >
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isStopping && "animate-spin")} /> 
          {isStopping ? "Please wait..." : "Retry Camera"}
        </Button>
      </footer>
    </div>
  );
}
