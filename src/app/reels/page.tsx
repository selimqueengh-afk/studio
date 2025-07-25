
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { staticReels, type StaticReel } from '@/lib/reels';
import { ArrowLeft, PlayCircle } from 'lucide-react';

export default function ReelsGalleryPage() {

    if (!staticReels || staticReels.length === 0) {
        return (
            <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-foreground p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Video bulunamadı.</h1>
                <p className="text-muted-foreground">Görüntülenecek video yok.</p>
                 <Button asChild className="mt-4">
                    <Link href="/chat">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sohbete Dön
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Reels</h1>
                 <Button asChild variant="outline">
                    <Link href="/chat">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sohbete Dön
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staticReels.map((reel: StaticReel) => (
                    <Link href={`/reels/${reel.id}`} key={reel.id} className="group">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border">
                            <video
                                src={reel.videoUrl}
                                preload="metadata"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            >
                                Tarayıcınız video etiketini desteklemiyor.
                            </video>
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayCircle className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="font-semibold truncate">{reel.description}</p>
                            <p className="text-sm text-muted-foreground">{reel.author}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
