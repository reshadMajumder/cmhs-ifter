
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import QRCode from 'qrcode.react';
import { Users, Baby, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketType = 'New Generation' | 'Golden Era' | 'Vintage RBMBIAN' | 'Premium';

interface TicketCardProps {
  alumniName: string;
  ticketType: TicketType;
  guestCount: number;
  childCount: number;
  secretCode: string;
  isDonator: boolean;
}

const ticketStyles: Record<TicketType, { bg: string, text: string, badge: string, headline: string }> = {
    'New Generation': {
        bg: 'from-cyan-800 via-teal-800 to-green-800',
        text: 'text-white',
        badge: 'bg-cyan-500 text-white',
        headline: 'font-bold font-headline'
    },
    'Golden Era': {
        bg: 'from-amber-700 via-yellow-800 to-orange-900',
        text: 'text-white',
        badge: 'bg-amber-500 text-black',
        headline: 'font-bold font-headline'
    },
    'Vintage RBMBIAN': {
        bg: 'from-purple-900 via-indigo-800 to-purple-900',
        text: 'text-white',
        badge: 'bg-purple-400 text-purple-900',
        headline: 'font-bold font-headline'
    },
    'Premium': {
        bg: 'from-black via-gray-900 to-amber-900',
        text: 'text-amber-100',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
        headline: 'font-headline font-bold text-yellow-300'
    }
};

const TicketCard = React.forwardRef<HTMLDivElement, TicketCardProps>(({
  alumniName,
  ticketType,
  guestCount,
  childCount,
  secretCode,
  isDonator,
}, ref) => {
    const finalTicketType = isDonator ? 'Premium' : ticketType;
    const styles = ticketStyles[finalTicketType];

  return (
    <Card ref={ref} className={cn("w-full max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden font-sans bg-gradient-to-br", styles.bg)}>
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Event Info */}
        <div className={cn("w-full md:w-2/3 p-6 md:p-8 relative flex flex-col justify-between", styles.text)}>
            <div className="absolute inset-0 z-0 opacity-10">
                <Logo className="w-full h-full" />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-light tracking-widest uppercase opacity-80">RBMBIAN Association Presents</p>
                <h2 className={cn("text-5xl md:text-6xl mt-2", styles.headline)}>
                Grand Reunion 2026
                </h2>
            </div>
            <div className="relative z-10 mt-8 md:mt-0">
                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4 text-center">
                    <div>
                        <p className="font-bold text-lg">Mar 23, 2026</p>
                        <p className="text-xs opacity-70">Date</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg">10:00 AM</p>
                        <p className="text-xs opacity-70">Time</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg">RBMB Campus</p>
                        <p className="text-xs opacity-70">Venue</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side - QR Code */}
        <div className={cn("w-full md:w-1/3 bg-black/20 p-6 flex flex-col items-center justify-center text-center relative backdrop-blur-sm", styles.text)}>
             <div className="absolute top-0 bottom-0 left-0 hidden md:block border-l border-dashed border-white/30"></div>

          <div className="w-full flex flex-col items-center justify-center h-full">
            <p className="font-bold tracking-wider text-lg">{alumniName}</p>
            <div className={cn("font-mono text-sm mb-2 opacity-80 px-3 py-1 rounded-full text-xs font-bold", styles.badge)}>
                {finalTicketType}
            </div>

             {isDonator && (
                <div className="flex items-center gap-1.5 text-amber-300 text-xs mb-2">
                    <Star className="h-3 w-3" />
                    <span>Valued Contributor</span>
                </div>
            )}
            
            <div className="flex gap-4 my-2 text-sm">
                <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{guestCount} Guest{guestCount !== 1 && 's'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Baby className="h-4 w-4" />
                    <span>{childCount} Child{childCount !== 1 && 'ren'}</span>
                </div>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-md inline-block my-2">
              <QRCode value={secretCode} size={128} level="H" bgColor="#FFFFFF" fgColor="#000000" />
            </div>
            <p className="mt-2 text-xs font-mono px-4 opacity-70 break-all">
              {secretCode}
            </p>
            <p className="mt-4 text-xs font-light px-4 opacity-90">
              Show this ticket at the entrance to get your event kit.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
