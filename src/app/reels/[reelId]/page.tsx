
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { staticReels, type StaticReel } from '@/lib/reels';
import ShareReelSheet from '@/components/reels/ShareReelSheet';

export default function ReelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reelId = params.reelId as string;

    const [reel, setReel] = useState<StaticReel | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        const foundReel = staticReels.find(r => r.id === reelId);
        if (foundReel) {
            setReel(foundReel);
        } else {
            // İsteğe bağlı: Video bulunamazsa kullanıcıyı galeriye geri yönlendir
            router.push('/reels');
        }
    }, [reelId, router]);

    if (!reel) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen w-full bg-black text-white p-4">
                <header className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" asChild>
                         <Link href="/reels">
                            <ArrowLeft className="h-6 w-6" />
                         </Link>
                    </Button>
                    <div className="text-right">
                        <h1 className="font-bold text-lg">{reel.author}</h1>
                        <p className="text-sm text-muted-foreground">{reel.description}</p>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center">
                    <video
                        key={reel.id}
                        src={reel.videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="max-w-full max-h-full"
                    >
                        Tarayıcınız video etiketini desteklemiyor.
                    </video>
                </main>

                <footer className="flex justify-center p-4">
                    <Button onClick={() => setIsSheetOpen(true)} size="lg">
                        <Send className="mr-2 h-5 w-5" />
                        Paylaş
                    </Button>
                </footer>
            </div>
            
            {/* Paylaşım Paneli */}
            {isSheetOpen && (
                 <ShareReelSheet
                    reel={reel}
                    isOpen={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                />
            )}
        </>
    );
}
