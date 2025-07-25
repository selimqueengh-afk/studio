
"use client";

import type { StaticReel } from "@/lib/reels";
import { cn } from "@/lib/utils";

interface ReelCardProps {
    reel: StaticReel;
    isShared?: boolean;
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {

    if (isShared) {
        // Shared reel in a chat message
        return (
            <div className="relative aspect-video w-64 rounded-lg border bg-black overflow-hidden">
                 <video
                    src={reel.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                >
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            </div>
        )
    }

    // Fullscreen reel on the reels page
    return (
        <div className="absolute inset-0 w-full h-full bg-black">
            <video
                src={reel.videoUrl}
                controls
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
            >
                Tarayıcınız video etiketini desteklemiyor.
            </video>
        </div>
    );
}
