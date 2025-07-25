
"use client";

import type { StaticReel } from "@/lib/reels";
import { cn } from "@/lib/utils";

interface ReelCardProps {
    reel: StaticReel;
    isShared?: boolean; // Bu prop şimdilik kullanılmıyor ama uyumluluk için kalabilir.
}

export default function ReelCard({ reel, isShared = false }: ReelCardProps) {
    if (!reel) {
        return null;
    }

    // En basit ve en güvenilir yöntem:
    // Hiçbir karmaşık mantık olmadan videoyu doğrudan tarayıcı kontrolleriyle göster.
    return (
        <div className={cn("relative w-full h-full bg-black", isShared ? 'aspect-video w-64 rounded-lg border' : '')}>
            <video
                src={reel.videoUrl}
                loop
                playsInline
                controls // Tarayıcının kendi oynat/durdur butonlarını gösterir. En güvenilir yöntem.
                preload="metadata" // Videonun ilk karesini kapak fotoğrafı gibi yükler.
                className="w-full h-full object-cover"
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
