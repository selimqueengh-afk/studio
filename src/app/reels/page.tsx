
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staticReels, type StaticReel } from '@/lib/reels';

export default function ReelsPage() {
  const [reels] = useState<StaticReel[]>(staticReels);

  if (!reels || reels.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Video bulunamadı.</h1>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory">
      {/* Header (Back Button) */}
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
        </section>
      ))}
    </div>
  );
}
