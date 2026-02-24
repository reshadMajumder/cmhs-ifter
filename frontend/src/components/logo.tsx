import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn('relative', className)}>
      <Image
        fill
        src="https://res.cloudinary.com/dzgs1uhn0/image/upload/v1761321902/WhatsApp_Image_2025-10-22_at_8.03.08_PM-removebg-preview_v15nme.png"
        alt="Ranir Bazar Model School Reunion Logo"
        className="object-contain"
        unoptimized
      />
    </div>
  );
};
