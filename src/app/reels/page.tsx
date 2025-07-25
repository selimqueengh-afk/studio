
"use client";

import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staticReels, type StaticReel } from '@/lib/reels';
import { useState } from 'react';
import ShareReelSheet from '@/components/reels/ShareReelSheet';

export default function ReelsPage() {
    const [reels] = useState<StaticReel[]>(staticReels);
    const [selectedReel, setSelectedReel] = useState<StaticReel | null>(null);

    const handleShareClick = (reel: StaticReel) => {
        setSelectedReel(reel);
    };


    if (!reels || reels.length === 0) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Video bulunamadı.</h1>
                <p className="text-muted-foreground">Görüntülenecek video yok.</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative h-screen w-full bg-black overflow-y-auto snap-y snap-mandatory">
                
                {/* Header (Back Button) is now inside the scroll container but fixed */}
                <div className="absolute top-4 left-4 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-black/50 hover:bg-black/70 rounded-full"
                        asChild
                    >
                        <Link href="/chat">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                    </Button>
                </div>

                {reels.map((reel) => (
                    <section
                        key={reel.id}
                        className="relative h-screen w-full snap-start flex items-center justify-center"
                    >
                        <video
                            src={reel.videoUrl}
                            controls
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain"
                        >
                            Tarayıcınız video etiketini desteklemiyor.
                        </video>
                        
                        {/* Overlay for Author/Description and Share Button */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-lg">{reel.author}</h3>
                                    <p className="text-sm">{reel.description}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white rounded-full w-12 h-12"
                                    onClick={() => handleShareClick(reel)}
                                >
                                    <Send className="w-7 h-7" />
                                </Button>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {selectedReel && (
                <ShareReelSheet
                    reel={selectedReel}
                    isOpen={!!selectedReel}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedReel(null);
                        }
                    }}
                />
            )}
        </>
    );
}
