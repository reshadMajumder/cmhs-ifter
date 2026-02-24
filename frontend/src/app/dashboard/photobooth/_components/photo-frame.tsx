
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, Download, RefreshCw, Camera, Book, Pencil, Compass, ZoomIn, MoveVertical, MoveHorizontal, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Logo } from '@/components/logo';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function PhotoFrame() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
            variant: 'destructive',
            title: 'Image too large',
            description: 'Please upload an image smaller than 5MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        resetImagePosition();
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDownloadClick = () => {
    if (!frameRef.current) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not capture the image. Please try again.',
        });
        return;
    };
    html2canvas(frameRef.current, { 
        useCORS: true,
        backgroundColor: null, // Make background transparent
        scale: 2 // Increase resolution
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'rbmb-reunion-frame.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetImage = () => {
    setUserImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    resetImagePosition();
  }

  const resetImagePosition = () => {
    setPosition({ x: 50, y: 50 });
    setScale(100);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Controls</h3>
            <div className="p-4 border rounded-lg space-y-4">
                 <Button onClick={handleUploadClick} className="w-full">
                    <Upload className="mr-2" /> Upload Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
                 <Button onClick={handleDownloadClick} disabled={!userImage} className="w-full">
                    <Download className="mr-2" /> Download Image
                </Button>
                {userImage && (
                    <Button onClick={resetImage} variant="outline" className="w-full">
                        <RefreshCw className="mr-2" /> Change Photo
                    </Button>
                )}
            </div>
            
            {userImage && (
                 <div className="p-4 border rounded-lg space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="zoom" className="flex items-center"><ZoomIn className="mr-2"/>Zoom</Label>
                        <Slider id="zoom" value={[scale]} onValueChange={([val]) => setScale(val)} min={50} max={200} step={1} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="vertical" className="flex items-center"><MoveVertical className="mr-2"/>Vertical Position</Label>
                        <Slider id="vertical" value={[position.y]} onValueChange={([val]) => setPosition(p => ({...p, y: val}))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="horizontal" className="flex items-center"><MoveHorizontal className="mr-2"/>Horizontal Position</Label>
                        <Slider id="horizontal" value={[position.x]} onValueChange={([val]) => setPosition(p => ({...p, x: val}))} />
                    </div>
                    <Button onClick={resetImagePosition} variant="ghost" size="sm" className="w-full">
                        <RefreshCcw className="mr-2"/> Reset Position
                    </Button>
                 </div>
            )}

            <p className="text-xs text-muted-foreground p-4">
                Your photo is processed entirely in your browser and is not uploaded to any server.
            </p>
        </div>
        
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div ref={frameRef} className="relative w-full aspect-square bg-gradient-to-br from-yellow-200 via-blue-300 to-sky-400 rounded-lg overflow-hidden flex items-center justify-center p-4">
                {/* Background Logo */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <Logo className="w-full h-full" />
                </div>
                {/* Background Texts & Icons */}
                <span className="absolute top-[10%] left-[5%] text-4xl font-headline text-purple-400/50 -rotate-12 opacity-80">Reunion</span>
                <span className="absolute bottom-[8%] right-[5%] text-5xl font-graffiti text-accent/50 rotate-6 opacity-80">স্মৃতিচারণ</span>
                <span className="absolute bottom-[20%] left-[8%] text-lg font-bold font-headline text-pink-400/70 -rotate-6">2026</span>
                <span className="absolute top-[15%] right-[10%] text-2xl font-bold font-graffiti text-green-500/60 rotate-12">RBMB</span>
                <span className="absolute top-[30%] right-[15%] text-xl font-headline text-white/60 -rotate-12">Friends</span>
                <span className="absolute bottom-[35%] left-[10%] text-2xl font-graffiti text-red-400/50 rotate-12">আড্ডা</span>
                <span className="absolute top-[50%] left-[5%] text-md font-headline text-blue-800/40 rotate-12">Classroom</span>
                <span className="absolute bottom-[45%] right-[8%] text-md font-graffiti text-yellow-300/80 -rotate-12">Memories</span>

                <Book className="absolute top-[60%] left-[15%] text-white/40 h-8 w-8 rotate-12" />
                <Pencil className="absolute top-[20%] right-[40%] text-indigo-400/50 h-6 w-6 -rotate-45" />
                <Compass className="absolute bottom-[15%] right-[30%] text-white/30 h-10 w-10 rotate-[25deg]" />

                {/* Circular Frame for User Image */}
                <div className="relative z-10 w-2/3 aspect-square rounded-full border-4 border-white shadow-2xl flex items-center justify-center bg-muted/50 overflow-hidden">
                     {userImage ? (
                        <div className="absolute w-full h-full"
                             style={{
                                transform: `scale(${scale / 100}) translateX(${position.x - 50}%) translateY(${position.y - 50}%)`,
                                transition: 'transform 0.1s ease-out'
                             }}>
                            <Image src={userImage} alt="Your photo" layout="fill" objectFit="cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                            <Camera className="h-12 w-12 mb-2" />
                            <p className="text-sm">Your photo goes here</p>
                        </div>
                    )}
                </div>

                 {/* Foreground Texts & Logo */}
                <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 drop-shadow-md">
                        <Logo className="h-10 w-10" />
                        <span className="font-headline text-lg text-white font-bold">RBMB Reunion</span>
                    </div>
                     <p className="font-graffiti text-xl text-amber-300 text-right drop-shadow-md">Back to Where It All Began</p>
                </div>
            </div>
        </div>
    </div>
  );
}
