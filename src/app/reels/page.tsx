
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { staticReels, type StaticReel } from '@/lib/reels';
import ShareReelSheet from '@/components/reels/ShareReelSheet';

export default function ReelsPage() {
    const [selectedReel, setSelectedReel] = useState<StaticReel | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleShareClick = (reel: StaticReel) => {
        setSelectedReel(reel);
        setIsSheetOpen(true);
    };
    
    return (
        <>
            <div className="relative h-screen w-full bg-black overflow-hidden">
                <div className="absolute top-4 left-4 z-20">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/chat">
                            <ArrowLeft className="h-6 w-6 text-white" />
                        </Link>
                    </Button>
                </div>

                <div className="h-full w-full overflow-y-auto snap-y snap-mandatory">
                    {staticReels.map((reel) => (
                        <section key={reel.id} className="relative h-full w-full snap-start flex items-center justify-center">
                            <video
                                src={reel.videoUrl}
                                controls
                                loop
                                playsInline
                                className="w-full h-full object-contain"
                            >
                                Tarayıcınız video etiketini desteklemiyor.
                            </video>
                            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                                <div className="flex items-end justify-between">
                                    <div className="max-w-[calc(100%-60px)]">
                                        <h3 className="font-bold truncate">{reel.author}</h3>
                                        <p className="text-sm">{reel.description}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleShareClick(reel)}>
                                        <Send className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            {selectedReel && isSheetOpen && (
                 <ShareReelSheet
                    reel={selectedReel}
                    isOpen={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                />
            )}
        </>
    );
}
