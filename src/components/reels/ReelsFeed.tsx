
"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { type Reel } from '@/lib/reels';
import { cn } from '@/lib/utils';

function ReelItem({
  reel,
  isVisible,
}: {
  reel: Reel;
  isVisible: boolean;
}) {
  // Add mute=1 to ensure autoplay works on most browsers.
  const videoSrc = `https://www.youtube.com/embed/${reel.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${reel.id}`;

  // Don't render iframe if not visible to save resources and prevent background playback
  if (!isVisible) {
    return null;
  }

  return (
    <section className="relative h-full w-full snap-start flex items-center justify-center bg-black">
      <iframe
        src={videoSrc}
        title={reel.description}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full absolute inset-0"
      ></iframe>

      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col justify-between pointer-events-none h-full">
        {/* Top Gradient */}
        <div className="p-4 bg-gradient-to-b from-black/60 to-transparent text-white">
          {/* You can add top-aligned elements here if needed */}
        </div>

        {/* Bottom UI */}
        <div className="p-4 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="flex items-end">
            {/* Left side: Author Info */}
            <div className="flex-1 max-w-[calc(100%-60px)] flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white/50">
                <AvatarImage src={reel.author.avatar} />
                <AvatarFallback>{getInitials(reel.author.nickname)}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <h3 className="font-bold truncate">@{reel.author.nickname}</h3>
                <p className="text-sm line-clamp-2">{reel.description}</p>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex flex-col items-center gap-4 pointer-events-auto mb-4">
              <ShareReelSheet reel={reel}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white h-12 w-12">
                  <Send className="h-7 w-7" />
                  <span className="sr-only">Paylaş</span>
                </Button>
              </ShareReelSheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReelsFeed({ shortsData }: { shortsData: Reel[] }) {
  const [visibleReelId, setVisibleReelId] = useState<string | null>(shortsData.length > 0 ? shortsData[0].id : null);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const reelId = entry.target.getAttribute('data-reel-id');
        setVisibleReelId(reelId);
      }
    });
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    });

    const reelElements = document.querySelectorAll('.reel-container');
    reelElements.forEach(el => observer.current?.observe(el));

    return () => {
      reelElements.forEach(el => observer.current?.unobserve(el));
    };
  }, [handleIntersection, shortsData]);

  if (!shortsData || shortsData.length === 0) {
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
    <div className="relative h-screen w-full bg-black group">
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
          <Link href="/chat">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
        {shortsData.map((reel) => (
          <div
            key={reel.id}
            data-reel-id={reel.id}
            className="reel-container h-full w-full"
          >
            <ReelItem
              reel={reel}
              isVisible={visibleReelId === reel.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
