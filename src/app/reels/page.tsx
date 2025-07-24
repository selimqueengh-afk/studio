
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Loader2, PlayCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareReelSheet from '@/components/reels/ShareReelSheet';

interface Reel {
  id: number;
  videoUrl: string;
  thumbnailUrl: string;
  author: string;
}

const generateMockReels = (count: number, page: number): Reel[] => {
  const reels: Reel[] = [];
  for (let i = 0; i < count; i++) {
    const id = page * count + i;
    reels.push({
      id: id,
      videoUrl: `https://placehold.co/1080x1920.png?text=Video+${id}`,
      thumbnailUrl: `https://placehold.co/1080x1920.png?text=Reel+${id}`,
      author: `@kullanici${id}`,
    });
  }
  return reels;
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreReels = useCallback(async () => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const newReels = generateMockReels(5, page);
    setReels(prev => [...prev, ...newReels]);
    setPage(prev => prev + 1);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadMoreReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastReelElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreReels();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadMoreReels]);
  
  const handleShareClick = (reel: Reel) => {
    setSelectedReel(reel);
    setShareSheetOpen(true);
  };

  return (
    <div className="h-full w-full max-w-md mx-auto bg-black overflow-y-auto snap-y snap-mandatory">
      {reels.map((reel, index) => (
        <div 
          ref={reels.length === index + 1 ? lastReelElementRef : null}
          key={reel.id} 
          className="h-full w-full snap-center relative flex items-center justify-center"
        >
          <Image
            src={reel.thumbnailUrl}
            alt={`Reel from ${reel.author}`}
            layout="fill"
            objectFit="cover"
            priority={index < 2}
            data-ai-hint="video reel"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute text-white z-10 flex flex-col items-center justify-center">
             <PlayCircle className="w-24 h-24 text-white/50" />
          </div>
           <div className="absolute bottom-16 left-4 text-white z-10">
                <p className="font-bold">{reel.author}</p>
                <p className="text-sm">Bu harika bir video! #eğlence</p>
            </div>
            <div className="absolute bottom-16 right-4 flex flex-col gap-4 z-10">
                 <Button variant="ghost" size="icon" className="text-white h-12 w-12" onClick={() => handleShareClick(reel)}>
                    <Send className="w-7 h-7" />
                 </Button>
            </div>
        </div>
      ))}
      {loading && (
        <div className="h-full w-full snap-center flex items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {selectedReel && (
         <ShareReelSheet 
            reel={selectedReel}
            isOpen={isShareSheetOpen}
            onOpenChange={setShareSheetOpen}
         />
      )}
    </div>
  );
}
