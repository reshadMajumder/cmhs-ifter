
import { Megaphone } from "lucide-react";

export default function MarqueeNotice() {
  const noticeText = "Registration: November, 2025 - December 31, 2025.";

  return (
    <div className="bg-primary text-primary-foreground relative flex overflow-x-hidden py-3">
      <div className="py-2 animate-marquee whitespace-nowrap flex items-center">
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
      </div>

      <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex items-center h-full">
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
        <Megaphone className="h-5 w-5 mx-4" />
        <span className="text-sm font-semibold">{noticeText}</span>
      </div>
    </div>
  );
}
