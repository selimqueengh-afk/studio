
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Loader2, PlayCircle, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeShorts, type Reel } from '@/lib/youtube';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const { toast } = useToast();

  const loadMoreReels = useCallback(async (token?: string) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const { reels: newReels, nextPageToken: newNextPageToken } = await getYoutubeShorts(token);
      
      setReels(prev => [...prev, ...newReels]);
      setNextPageToken(newNextPageToken);

      if (!newNextPageToken) {
        setHasMore(false);
      }

    } catch (err: any) {
        console.error("Error fetching reels: ", err);
        setError(err.message || "Videolar yüklenirken bilinmeyen bir sorun oluştu.");
        setHasMore(false); // Stop trying to load more if there's an error
    } finally {
        setLoading(false);
    }
  }, [loading, hasMore]);

  // Initial load
  useEffect(() => {
    loadMoreReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastReelElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreReels(nextPageToken);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreReels, nextPageToken]);
  
  const handleShareClick = (reel: Reel) => {
    setSelectedReel(reel);
    setShareSheetOpen(true);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center text-white p-4 text-center bg-black">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Bir Hata Oluştu</h2>
          <p className="max-w-sm text-muted-foreground">{error}</p>
          <p className="max-w-sm text-muted-foreground mt-4 text-xs">
            Bu, genellikle bir API anahtarının eksik veya yanlış olduğu anlamına gelir. Lütfen geliştirici talimatlarını kontrol edin.
          </p>
        </div>
      );
    }

    if (reels.length === 0 && !loading) {
       return (
        <div className="h-full w-full flex items-center justify-center text-white p-4 text-center bg-black">
            <p>Hiç video bulunamadı. Lütfen daha sonra tekrar kontrol edin!</p>
        </div>
      );
    }
    
    return reels.map((reel, index) => (
      <div 
        ref={reels.length === index + 1 ? lastReelElementRef : null}
        key={reel.id + index} 
        className="h-full w-full snap-center relative flex items-center justify-center bg-black"
      >
        <Image
          src={reel.thumbnailUrl}
          alt={reel.description || `Reel from ${reel.author}`}
          fill
          style={{ objectFit: "contain" }} // Use contain to avoid cropping issues with different aspect ratios
          priority={index < 2}
          data-ai-hint="youtube short"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute text-white z-10 flex flex-col items-center justify-center cursor-pointer">
           <PlayCircle className="w-24 h-24 text-white/70 hover:text-white/90 transition-colors" />
        </a>
         <div className="absolute bottom-16 left-4 text-white z-10 max-w-[calc(100%-5rem)]">
              <p className="font-bold">{reel.author}</p>
              <p className="text-sm truncate">{reel.description}</p>
          </div>
          <div className="absolute bottom-16 right-4 flex flex-col gap-4 z-10">
               <Button variant="ghost" size="icon" className="text-white h-12 w-12 bg-black/20 hover:bg-black/40" onClick={() => handleShareClick(reel)}>
                  <Send className="w-7 h-7" />
               </Button>
          </div>
      </div>
    ))
  }

  return (
    <div className="h-full w-full max-w-md mx-auto bg-black overflow-y-auto snap-y snap-mandatory">
      {renderContent()}
      {loading && (
        <div className="h-full w-full snap-center flex items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {!loading && !hasMore && reels.length > 0 && (
         <div className="h-24 w-full flex items-center justify-center text-white/70">
            <p>Daha fazla video yok.</p>
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
