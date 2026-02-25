
'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Baby, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketType = 'Modern CMHSIAN' | 'Vintage CMHSIAN' | 'Premium';

interface TicketCardProps {
  alumniName: string;
  ticketType: TicketType;
  secretCode: string;
  isDonator: boolean;
  phone?: string;
  batch?: string;
}

const ticketStyles: Record<TicketType, {
  bg: string,
  text: string,
  badge: string,
  headline: string,
  secondary: string,
  accent: string,
  border: string
}> = {
  'Modern CMHSIAN': {
    bg: 'from-[#2d1b4e] via-[#5d3a7a] to-[#2d1b4e]',
    text: 'text-white',
    badge: 'bg-gradient-to-r from-sky-200 to-blue-300 text-blue-900',
    headline: 'font-bold font-headline text-sky-100',
    secondary: 'text-blue-100',
    accent: 'border-sky-200/40',
    border: 'from-sky-200/30 via-blue-300/50 to-sky-200/30'
  },
  'Vintage CMHSIAN': {
    bg: 'from-[#2d1b4e] via-[#5d3a7a] to-[#2d1b4e]',
    text: 'text-white',
    badge: 'bg-gradient-to-r from-sky-200 to-blue-300 text-blue-900',
    headline: 'font-bold font-headline text-sky-100',
    secondary: 'text-blue-100',
    accent: 'border-sky-200/40',
    border: 'from-sky-200/30 via-blue-300/50 to-sky-200/30'
  },
  'Premium': {
    bg: 'from-[#2d1b4e] via-[#5d3a7a] to-[#2d1b4e]',
    text: 'text-white',
    badge: 'bg-gradient-to-r from-sky-200 via-blue-300 to-sky-300 text-blue-900',
    headline: 'font-headline font-bold text-sky-100',
    secondary: 'text-blue-100',
    accent: 'border-sky-200/40',
    border: 'from-sky-200/30 via-blue-300/50 to-sky-200/30'
  }
};

// Islamic Geometric Pattern SVG Component — uses only inline paths (no <pattern>) for html2canvas compatibility
const IslamicPattern = ({ className }: { className?: string }) => {
  const diamonds: React.ReactNode[] = [];
  const cols = 12;
  const rows = 6;
  const w = 80;
  const h = 80;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * w + 40;
      const cy = r * h + 40;
      diamonds.push(
        <path
          key={`d-${r}-${c}`}
          d={`M${cx} ${cy - 20} L${cx + 20} ${cy} L${cx} ${cy + 20} L${cx - 20} ${cy} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.08"
        />
      );
      diamonds.push(
        <circle
          key={`c-${r}-${c}`}
          cx={cx}
          cy={cy}
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.05"
        />
      );
    }
  }
  return (
    <svg className={className} viewBox="0 0 960 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      {diamonds}
    </svg>
  );
};

// Mihrab (Arch) SVG Component

// Mihrab (Arch) SVG Component
const MihrabArch = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 150V60C0 30 25 5 50 0C75 5 100 30 100 60V150" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
    <path d="M5 150V62C5 35 28 8 50 4C72 8 95 35 95 62V150" stroke="currentColor" strokeWidth="0.2" opacity="0.1" />
  </svg>
);

const TicketCard = React.forwardRef<HTMLDivElement, TicketCardProps>(({
  alumniName,
  ticketType,
  secretCode,
  isDonator,
  phone,
  batch,
}, ref) => {
  const finalTicketType = isDonator ? 'Premium' : ticketType;
  const styles = ticketStyles[finalTicketType];

  return (
    <div className="w-full overflow-x-auto">
    <Card
      ref={ref}
      data-ticket-capture-root="true"
      className={cn("w-[900px] h-[400px] mx-auto shadow-2xl rounded-2xl overflow-hidden font-sans bg-gradient-to-br relative border-none shrink-0", styles.bg)}
    >
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bg.png"
          alt=""
          aria-hidden="true"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />

        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-100">
          <IslamicPattern className={cn("w-full h-full", styles.text)} />
        </div>

        {/* Decorative Mihrab Arches */}
        <div className="absolute inset-0 flex justify-around items-end px-12 opacity-40">
          <MihrabArch className={cn("h-[90%] w-auto", styles.text)} />
          <MihrabArch className={cn("h-[90%] w-auto", styles.text)} />
        </div>

        {/* Gradient Overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-pink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* Decorative Lanterns at Top */}
      <div className="absolute top-0 left-0 right-0 z-[3] pointer-events-none overflow-hidden h-24">
        {/* Repeat lantern image 5× side by side instead of CSS background-repeat (html2canvas incompatible) */}
        <div className="absolute top-[-15px] left-0 w-full h-[100px] flex opacity-50">
          {[0,1,2,3,4].map(i => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/lantern.png"
              alt=" no"
              aria-hidden="true"
              crossOrigin="anonymous"
              className="h-[100px] w-[200px] object-cover flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Main Content - Landscape Layout */}
      <div className="flex h-full relative z-10">

        {/* Left Section - Logo & Branding */}
        <div className={cn("w-[15%] flex flex-col items-center justify-center bg-black/20 border-r", styles.accent)}>
          <div className="flex flex-col items-center gap-2">
            <div className={cn("p-2 rounded-full bg-gradient-to-br", styles.badge)}>
              <Logo className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Center Section - Event Details */}
        <div className={cn("flex-1 px-10 py-8 flex flex-col justify-between", styles.text)}>

          {/* Top: Event Title */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest", styles.badge)}>
                CMHS ALUMNI ASSOCIATION
              </div> */}
              {isDonator && (
                <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-wider", styles.badge)}>
                  <Sparkles className="h-3 w-3" />
                  <span>VIP</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className={cn("text-6xl tracking-tight leading-none mb-2", styles.headline)}>
                CMHS Grand Iftar
              </h2>
              <div className="flex items-center gap-3">
                <div className={cn("h-[1.5px] w-12 bg-gradient-to-r", styles.border)} />
                <h3 className={cn("text-3xl font-invitation", styles.secondary)}>
                  Mahfil 2026
                </h3>
              </div>
            </div>
          </div>

          {/* Middle: Attendee Info */}
          <div className={cn("bg-black/40 rounded-xl px-5 py-4 border inline-block", styles.accent)}>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">Guest Name</p>
                <p className="text-2xl font-bold">{alumniName}</p>
              </div>
              <div className={cn("w-[1px] h-10 bg-gradient-to-b", styles.border)} />
              {batch && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">Batch</p>
                  <p className="text-xl font-semibold">{batch}</p>
                </div>
              )}
              {phone && (
                <>
                  <div className={cn("w-[1px] h-10 bg-gradient-to-b", styles.border)} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">Contact</p>
                    <p className="text-sm font-mono opacity-90">{phone}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom: Event Details - Simplified */}
          <div className="flex items-center gap-10 opacity-80">
            <div className="flex flex-col">
              <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Date</p>
              <p className="text-xl font-bold">March 18, 2026</p>
            </div>

            <div className={cn("w-[1px] h-8 bg-gradient-to-b", styles.border)} />

            <div className="flex flex-col">
              <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Time</p>
              <p className="text-xl font-bold">03:00 PM</p>
            </div>

            <div className={cn("w-[1px] h-8 bg-gradient-to-b", styles.border)} />

            <div className="flex flex-col">
              <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Venue</p>
              <p className="text-xl font-bold">CMHS Campus</p>
            </div>
          </div>
        </div>

        {/* Right Section - QR Code */}
        <div className={cn("w-[20%] flex flex-col items-center justify-center bg-black/20 border-l px-6 py-8", styles.text, styles.accent)}>
          <div className="space-y-4 flex flex-col items-center">
            <p className="text-[8px] uppercase tracking-[0.3em] opacity-50 font-semibold">Entry Pass</p>

            {/* QR Code */}
            <div className={cn("p-[2px] rounded-2xl bg-gradient-to-br", styles.border)}>
              <div className="bg-white p-3 rounded-2xl">
                <QRCodeSVG
                  value={secretCode}
                  size={120}
                  level="H"
                />
              </div>
            </div>

            {/* UUID */}
            <div className="w-full">
              <p className="text-[7px] font-mono opacity-40 tracking-wider uppercase text-center mb-1">Code</p>
              <div className="bg-black/50 py-2 px-2 rounded-lg border border-white/10">
                <p className="text-[7px] font-mono opacity-80 break-all leading-relaxed text-center">
                  {secretCode.substring(0, 18)}
                </p>
              </div>
            </div>

            <p className="text-[7px] text-center opacity-50 leading-relaxed uppercase tracking-wide">
              Scan at entry
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 py-1.5 border-t border-white/10 flex items-center justify-between px-6">
        {/* Center: Powered by */}
        <div className="flex-1 flex justify-center">
          <span className="text-[8px] text-white opacity-90 tracking-wider font-semibold drop-shadow-sm">
            Powered by: <span className="font-bold">CMHS ALUMNI ASSOCIATION</span>
          </span>
        </div>
        {/* Right: System Generated */}
        <div className="flex-1 flex justify-end">
          <span className="text-[8px] text-white opacity-90 tracking-wider font-semibold drop-shadow-sm">
            System Generated • Dev: <span className={cn("font-semibold", styles.secondary, "text-white")}>Reshad (2019)</span> • www.reshad.dev
          </span>
        </div>
      </div>
    </Card>
    </div>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
