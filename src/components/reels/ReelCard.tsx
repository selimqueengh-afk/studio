
"use client";

import type { StaticReel } from "@/lib/reels";
import { cn } from "@/lib/utils";


interface ReelCardProps {
    reel: StaticReel;
    isShared?: boolean;
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {
    
    if (!reel) {
        return null;
    }

    const cardContent = (
         <div className={cn("relative w-full h-full", isShared ? 'aspect-video' : 'h-full')}>
            <video 
                src={reel.videoUrl}
                loop
                playsInline
                controls // Use browser's native controls. This is the most reliable way.
                preload="metadata" // Helps to show the first frame as a poster
                className="w-full h-full object-cover"
            >
                Tarayıcınız video etiketini desteklemiyor.
            </video>
            
            <div className="absolute bottom-4 left-4 text-white max-w-[calc(100%-4rem)] p-4 pointer-events-none">
                <div className="bg-black/30 p-2 rounded-lg">
                    <p className="font-bold text-lg truncate drop-shadow-lg">{reel.author}</p>
                    <p className="text-sm truncate drop-shadow-md">{reel.description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn(
            "bg-black overflow-hidden transition-shadow w-full h-full", 
            isShared 
                ? "w-64 rounded-lg border aspect-video" 
                : "w-full h-full"
        )}>
           {isShared ? (
             <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
               {cardContent}
             </a>
           ) : (
             cardContent
           )}
        </div>
    )
}
