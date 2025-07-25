
"use client";

import type { StaticReel } from "@/lib/reels";
import { cn } from "@/lib/utils";

interface ReelCardProps {
    reel: StaticReel;
    isShared?: boolean; // This prop can remain for compatibility but won't be used here.
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {
    // If for any reason the reel data is missing, prevent a crash.
    if (!reel || !reel.videoUrl) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center text-white">
                Video Yüklenemedi
            </div>
        );
    }

    // This is the most basic and failsafe way to render a video in HTML.
    // We are giving full control to the browser.
    return (
        <div className={cn(
            "relative w-full h-full bg-black", 
            isShared ? 'aspect-video w-64 rounded-lg border' : ''
        )}>
            <video
                key={reel.id} // Adding a key to help React differentiate videos
                src={reel.videoUrl}
                controls // Shows the browser's default play/pause/volume controls. This is the most reliable way.
                loop
                playsInline
                preload="metadata" // This helps show the first frame as a poster instead of a black screen.
                className="w-full h-full object-contain" // Using object-contain to ensure the whole video is visible.
            >
                Tarayıcınız video etiketini desteklemiyor.
            </video>
             {!isShared && (
                 <div className="absolute bottom-4 left-4 text-white max-w-[calc(100%-4rem)] p-4 pointer-events-none">
                    <div className="bg-black/30 p-2 rounded-lg">
                        <p className="font-bold text-lg truncate drop-shadow-lg">{reel.author}</p>
                        <p className="text-sm truncate drop-shadow-md">{reel.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
