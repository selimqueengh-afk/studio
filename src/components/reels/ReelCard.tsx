
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

    const videoElement = (
        <video 
            // The video URL is now directly and always assigned to the src attribute.
            src={reel.videoUrl}
            loop
            playsInline
            // Using the browser's native controls is the most reliable way to ensure playback.
            controls 
            // preload="metadata" helps to show the first frame as a poster instead of a black screen.
            preload="metadata" 
            className="w-full h-full object-cover"
        >
            Tarayıcınız video etiketini desteklemiyor.
        </video>
    );

    const cardContent = (
         <div className={cn("relative w-full h-full bg-black", isShared ? 'aspect-video' : '')}>
            {videoElement}
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
            "overflow-hidden transition-shadow w-full", 
            isShared 
                ? "w-64 rounded-lg border aspect-video" 
                : "h-full"
        )}>
           {isShared ? (
             // When shared, wrap with a link, but the video element inside remains the same.
             <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
               {cardContent}
             </a>
           ) : (
             cardContent
           )}
        </div>
    )
}
