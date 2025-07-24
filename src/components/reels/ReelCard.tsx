
"use client";

import Image from "next/image";
import { PlayCircle } from "lucide-react";

interface Reel {
    id: number;
    thumbnailUrl: string;
    author: string;
}

interface ReelCardProps {
    reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
    return (
        <div className="w-64 bg-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative aspect-[9/16]">
                <Image 
                    src={reel.thumbnailUrl}
                    alt={`Reel from ${reel.author}`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="video reel"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <PlayCircle className="w-12 h-12 text-white/70" />
                </div>
                <div className="absolute bottom-2 left-3 text-white">
                    <p className="font-bold text-sm">{reel.author}</p>
                </div>
            </div>
        </div>
    )
}
