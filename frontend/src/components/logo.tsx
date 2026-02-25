import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn('relative rounded-full bg-white p-1 overflow-hidden flex items-center justify-center', className)}>
      <Image
        fill
        src="https://res.cloudinary.com/dzdf1wu5x/image/upload/v1771998698/Expressive_Graffiti_Logo_for_Ramadan_Iftar-removebg-preview_ixylto.png"
        alt="CMHS GRAND IFTER MAHFIL 2026 Logo"
        className="object-contain"
        unoptimized
      />
    </div>
  );
};
