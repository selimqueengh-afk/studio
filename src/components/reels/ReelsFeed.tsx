
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { type Reel } from '@/lib/reels';
import { fetchYouTubeShorts } from '@/lib/youtube';

function ReelItem({
  reel,
  isVisible,
  isPreloading,
}: {
  reel: Reel;
  isVisible: boolean;
  isPreloading: boolean;
}) {
  const shouldRenderIframe = isVisible || isPreloading;

  // Use mute=1 to ensure autoplay works on most browsers.
  // The user can unmute manually via the YouTube player controls.
  const videoSrc = `https://www.youtube.com/embed/${reel.id}?autoplay=1&controls=1&modestbranding=1&loop=1&playlist=${reel.id}&mute=1`;

  return (
    <section className="relative h-full w-full snap-start flex items-center justify-center bg-black">
      {shouldRenderIframe && (
        <iframe
          src={videoSrc}
          title={reel.description}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full object-contain"
          // Disable pointer events for preloading iframes
          style={{
            pointerEvents: isVisible ? 'auto' : 'none',
          }}
        ></iframe>
      )}
      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        {/* Top Gradient */}
        <div className="pt-4 px-4 bg-gradient-to-b from-black/60 to-transparent" />
        
        {/* Middle section for button */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto">
            <ShareReelSheet reel={reel}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-12 w-12">
                  <Send className="h-7 w-7" />
                  <span className="sr-only">Paylaş</span>
                </Button>
            </ShareReelSheet>
        </div>


        {/* Bottom section for info */}
        <div className="p-4 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="flex items-end">
            <div className="flex-1 max-w-[calc(100%-80px)] flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white/50">
                <AvatarImage src={reel.author.avatar} />
                <AvatarFallback>{getInitials(reel.author.nickname)}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <h3 className="font-bold truncate">@{reel.author.nickname}</h3>
                <p className="text-sm line-clamp-2">{reel.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReelsFeed({ shortsData }: { shortsData: Reel[] }) {
  const [reels, setReels] = useState<Reel[]>(shortsData);
  const [visibleReelId, setVisibleReelId] = useState<string | null>(null);
  const [preloadReelId, setPreloadReelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMoreReels = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newReels = await fetchYouTubeShorts();
    // Add new reels, filtering out any potential duplicates from the API
    setReels(prevReels => {
        const existingIds = new Set(prevReels.map(r => r.id));
        const uniqueNewReels = newReels.filter(r => !existingIds.has(r.id));
        return [...prevReels, ...uniqueNewReels];
    });
    setIsLoading(false);
  }, [isLoading]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const reelId = entry.target.getAttribute('data-reel-id');
      const reelIndex = parseInt(entry.target.getAttribute('data-reel-index') || '0', 10);

      if (entry.isIntersecting) {
        setVisibleReelId(reelId);

        // Preload the next video
        if (reelIndex + 1 < reels.length) {
            setPreloadReelId(reels[reelIndex + 1].id);
        } else {
            setPreloadReelId(null);
        }
        
        // Load more when we are near the end (e.g., 3 videos away from the end)
        if (reelIndex >= reels.length - 3) {
            loadMoreReels();
        }
      }
    });
  }, [reels, loadMoreReels]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial visible and preload states
    if (reels.length > 0 && !visibleReelId) {
        setVisibleReelId(reels[0].id);
        if (reels.length > 1) {
            setPreloadReelId(reels[1].id);
        }
    }

    observer.current = new IntersectionObserver(handleIntersection, {
      root: container,
      rootMargin: '0px',
      // Start loading the next video when it's 50% visible, making transitions smoother
      threshold: 0.5,
    });

    const reelElements = container.querySelectorAll('.reel-container');
    reelElements.forEach(el => observer.current?.observe(el));

    return () => {
      reelElements.forEach(el => observer.current?.unobserve(el));
      observer.current?.disconnect();
    };
  }, [handleIntersection, reels, visibleReelId]);


  if (!reels || reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Videolar Yüklenemedi</h2>
        <p className="text-center text-muted-foreground mb-6">
          Videolar şu an mevcut değil. Lütfen daha sonra tekrar deneyin.
        </p>
        <Button asChild variant="secondary">
          <Link href="/chat">Sohbete Geri Dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
          <Link href="/chat">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      
      <div ref={containerRef} className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
        {reels.map((reel, index) => (
          <div
            key={`${reel.id}-${index}`} // Use index to ensure unique keys when reels might have same id
            data-reel-id={reel.id}
            data-reel-index={index}
            className="reel-container h-full w-full snap-start flex-shrink-0"
          >
            <ReelItem
              reel={reel}
              isVisible={visibleReelId === reel.id}
              isPreloading={preloadReelId === reel.id}
            />
          </div>
        ))}
        {isLoading && (
            <div className="h-full w-full snap-start flex-shrink-0 flex justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-white"/>
                    <p className="text-white/80 text-sm">Yeni videolar yükleniyor...</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
