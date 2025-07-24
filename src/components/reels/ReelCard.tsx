
"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { Reel } from "@/lib/youtube";
import { cn } from "@/lib/utils";


interface ReelCardProps {
    reel: Reel;
    isShared?: boolean;
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {
    if (!reel) {
        return null;
    }

    const cardContent = (
         <div className="relative aspect-[9/16] w-full h-full">
            {reel.thumbnailUrl ? (
                <img 
                    src={reel.thumbnailUrl}
                    alt={reel.description || `Reel from ${reel.author}`}
                    className="object-cover w-full h-full"
                    data-ai-hint="youtube short thumbnail"
                />
            ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <PlayCircle className="w-12 h-12 text-white/70" />
            </div>
            <div className="absolute bottom-2 left-3 text-white max-w-[calc(100%-1rem)]">
                <p className="font-bold text-sm truncate">{reel.author}</p>
                {isShared && <p className="text-xs truncate">{reel.description}</p>}
            </div>
        </div>
    );

    return (
        <div className={cn("bg-card border rounded-lg overflow-hidden transition-shadow", isShared ? "w-64 hover:shadow-md" : "w-full h-full", "cursor-pointer")}>
            <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
               {cardContent}
            </a>
        </div>
    )
}
