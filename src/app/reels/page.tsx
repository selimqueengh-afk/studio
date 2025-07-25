
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share, ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReelCard from '@/components/reels/ReelCard';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { staticReels, type StaticReel } from '@/lib/reels';

export default function ReelsPage() {
  const [reels] = useState<StaticReel[]>(staticReels);
  const [selectedReel, setSelectedReel] = useState<StaticReel | null>(null);

  const handleShare = (reel: StaticReel) => {
    setSelectedReel(reel);
  };
  
  if (!reels || reels.length === 0) {
    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Video bulunamadı.</h1>
        </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory">
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
        <section key={reel.id} className="relative h-screen w-full snap-start flex items-center justify-center bg-black">
          <div className="absolute bottom-20 right-2 z-20 flex flex-col gap-4">
              <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto gap-1">
                  <ThumbsUp className="w-8 h-8"/>
                  <span className="text-xs">Beğen</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto gap-1">
                  <MessageCircle className="w-8 h-8"/>
                  <span className="text-xs">Yorum</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto gap-1" onClick={() => handleShare(reel)}>
                  <Share className="w-8 h-8"/>
                  <span className="text-xs">Paylaş</span>
              </Button>
               <Button variant="ghost" size="icon" className="text-white flex flex-col h-auto gap-1">
                  <MoreVertical className="w-8 h-8"/>
              </Button>
          </div>
          <ReelCard reel={reel} />
        </section>
      ))}
      
      {selectedReel && (
        <ShareReelSheet
          reel={selectedReel}
          isOpen={!!selectedReel}
          onOpenChange={(isOpen) => !isOpen && setSelectedReel(null)}
        />
      )}
    </div>
  );
}
