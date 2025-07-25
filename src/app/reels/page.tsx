
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlayCircle, Send, AlertTriangle, VolumeX, Volume2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { useToast } from '@/hooks/use-toast';
import { getYoutubeShorts, type Reel } from '@/lib/youtube';
import { cn } from '@/lib/utils';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [intersectingReelId, setIntersectingReelId] = useState<string | null>(null);

  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);
  const { toast } = useToast();

  const loadMoreReels = useCallback(async (token?: string) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const { reels: newReels, nextPageToken: newNextPageToken } = await getYoutubeShorts(token);
      
      setReels(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const filteredNewReels = newReels.filter(r => !existingIds.has(r.id));
        return [...prev, ...filteredNewReels];
      });

      setNextPageToken(newNextPageToken);

      if (!newNextPageToken) {
        setHasMore(false);
      }

    } catch (err: any) {
        console.error("Error fetching reels: ", err);
        setError(err.message || "Videolar yüklenirken bilinmeyen bir sorun oluştu.");
        setHasMore(false);
    } finally {
        setLoading(false);
    }
  }, [loading, hasMore, nextPageToken]);

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

  const reelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
      const observer = new IntersectionObserver(
          (entries) => {
              entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                      setIntersectingReelId(entry.target.getAttribute('data-reel-id'));
                  }
              });
          },
          { rootMargin: '0px', threshold: 0.7 } // Trigger when 70% of the video is visible
      );

      const currentReelRefs = reelRefs.current;
      currentReelRefs.forEach((ref) => {
          if (ref) observer.observe(ref);
      });

      return () => {
         currentReelRefs.forEach((ref) => {
            if (ref) observer.unobserve(ref);
        });
        observer.disconnect();
      };
  }, [reels]);
  
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
    
    return reels.map((reel, index) => {
      const isPlaying = intersectingReelId === reel.id;
      const embedUrl = `https://www.youtube.com/embed/${reel.id}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&loop=1&playlist=${reel.id}&playsinline=1`;
      
      return (
        <div 
          ref={node => {
            if (node) reelRefs.current.set(reel.id, node);
            if (reels.length === index + 1) {
              lastReelElementRef(node as HTMLDivElement);
            }
          }}
          key={reel.id} 
          data-reel-id={reel.id}
          className="h-full w-full snap-start relative flex items-center justify-center bg-black overflow-hidden"
        >
          <iframe
            src={embedUrl}
            title={reel.description}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className={cn("absolute top-0 left-0 w-full h-full transition-opacity duration-500", isPlaying ? "opacity-100" : "opacity-0")}
          ></iframe>
           <img
            src={reel.thumbnailUrl}
            alt={reel.description || `Reel from ${reel.author}`}
            className={cn("object-cover w-full h-full transition-opacity duration-500 pointer-events-none", isPlaying ? 'opacity-0' : 'opacity-100')}
            data-ai-hint="youtube short"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
          
           <div className="absolute top-4 left-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white bg-black/20 hover:bg-black/40"
                    onClick={() => router.push('/chat')}
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

           <div className="absolute bottom-16 left-4 text-white z-10 max-w-[calc(100%-5rem)] pointer-events-none">
                <p className="font-bold">{reel.author}</p>
                <p className="text-sm truncate">{reel.description}</p>
            </div>
            <div className="absolute bottom-16 right-4 flex flex-col gap-4 z-10">
                 <Button variant="ghost" size="icon" className="text-white h-12 w-12 bg-black/20 hover:bg-black/40" onClick={() => setIsMuted(prev => !prev)}>
                   {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
                 </Button>
                 <Button variant="ghost" size="icon" className="text-white h-12 w-12 bg-black/20 hover:bg-black/40" onClick={() => handleShareClick(reel)}>
                    <Send className="w-7 h-7" />
                 </Button>
            </div>
        </div>
    )})
  }

  return (
    <div className="h-[100svh] w-full max-w-md mx-auto bg-black overflow-y-auto snap-y snap-mandatory relative">
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


