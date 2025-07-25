
"use client";

import { useState, useRef } from 'react';
import { PlayCircle, PauseCircle } from "lucide-react";
import type { StaticReel } from "@/lib/reels";
import { cn } from "@/lib/utils";


interface ReelCardProps {
    reel: StaticReel;
    isShared?: boolean;
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    if (!reel) {
        return null;
    }

    const handleVideoClick = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const cardContent = (
         <div className={cn("relative w-full h-full", isShared ? 'aspect-video' : 'h-full')}>
            <video 
                ref={videoRef}
                key={reel.videoUrl}
                src={reel.videoUrl}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onClick={handleVideoClick} // Allow pausing by clicking anywhere on the video
            >
                Tarayıcınız video etiketini desteklemiyor.
            </video>
            
            {!isPlaying && (
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={handleVideoClick}
                >
                    <PlayCircle className="w-20 h-20 text-white/70 drop-shadow-lg" />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 text-white max-w-[calc(100%-4rem)] p-4 pointer-events-none">
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
