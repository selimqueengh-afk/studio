
"use client";

import { PlayCircle } from "lucide-react";
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
            {reel.videoUrl ? (
                <video 
                    key={reel.videoUrl}
                    src={reel.videoUrl}
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
            <div className="absolute bottom-4 left-4 text-white max-w-[calc(100%-4rem)] p-4">
                <p className="font-bold text-lg truncate drop-shadow-lg">{reel.author}</p>
                <p className="text-sm truncate drop-shadow-md">{reel.description}</p>
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
