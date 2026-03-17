"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScannerView from '@/components/ScannerView';
import { VerificationType } from '@/lib/types';

export default function ScanPage({ params }: { params: Promise<{ type: string }> }) {
  const router = useRouter();
  const { type } = use(params) as { type: VerificationType };

  const handleScan = (decodedText: string) => {
    // Immediate visual feedback could go here if needed
    router.push(`/verify/${decodedText}?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <ScannerView 
        title={type === 'entrance' ? 'Verify Entrance' : 'Verify Service'} 
        onScan={handleScan} 
      />
    </div>
  );
}
