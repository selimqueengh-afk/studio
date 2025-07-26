
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { type Reel } from '@/lib/reels';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';


function ReelItem({ reel, isVisible, isMuted, toggleMute }: { reel: Reel; isVisible: boolean; isMuted: boolean; toggleMute: () => void; }) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  useEffect(() => {
    // This effect now only handles PAUSING the video when it's no longer visible.
    // Playing is handled by the onReady event to prevent race conditions.
    if (!isVisible && player) {
      // Small delay to prevent abrupt pause when scrolling
      setTimeout(() => {
        // Check if player is still valid and has the function before calling
        if (player && typeof player.pauseVideo === 'function') {
           player.pauseVideo()
        }
      }, 150);
    }
  }, [isVisible, player]);
  
  // This effect synchronizes the player's mute state with the global mute state.
  useEffect(() => {
    if (player) {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
    }
  }, [player, isMuted]);


  const onReady = (event: { target: YouTubePlayer }) => {
    setPlayer(event.target);
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
    // Only play the video once it's ready and confirmed to be visible.
    // This is the core fix for the race condition.
    if(isVisible) {
        event.target.playVideo();
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1, // Autoplay is handled by the onReady and isVisible logic
      controls: 0,
      modestbranding: 1,
      loop: 1,
      playlist: reel.id, // Required for loop
      playsinline: 1,
      mute: 1, // Start muted to allow autoplay in most browsers
    },
  };

  return (
    <section className="relative h-full w-full snap-start flex items-center justify-center bg-black">
      {/* The YouTube component is only mounted when it becomes visible, saving resources */}
      {isVisible && (
         <YouTube
            videoId={reel.id}
            opts={opts}
            onReady={onReady}
            className="w-full h-full object-contain absolute inset-0"
         />
      )}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-10 flex flex-col justify-between" onClick={toggleMute}>
        {/* Top Gradient and Header */}
        <div className="p-4 bg-gradient-to-b from-black/60 to-transparent text-white">
            {/* Header content can go here if needed */}
        </div>

        {/* Mute Icon */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {isMuted && <VolumeX className="h-12 w-12 text-white/50" />}
        </div>
        
        {/* Bottom Gradient and Info */}
        <div className="p-4 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="flex items-end justify-between">
            <div className="max-w-[calc(100%-60px)] flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white/50">
                <AvatarImage src={reel.author.avatar} />
                <AvatarFallback>{getInitials(reel.author.nickname)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold truncate">@{reel.author.nickname}</h3>
                <p className="text-sm line-clamp-2">{reel.description}</p>
              </div>
            </div>
             {/* We use stopPropagation to prevent the mute toggle when clicking the share button */}
            <div onClick={(e) => e.stopPropagation()}>
                <ShareReelSheet reel={reel}>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                        <Send className="h-6 w-6" />
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
  const [visibleReelIndex, setVisibleReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const reelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Make sure we have refs before setting up the observer
    if(reelRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleReelIndex(index);
          }
        });
      },
      { threshold: 0.7 } // Trigger when 70% of the video is visible
    );

    const currentRefs = reelRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [shortsData, reelRefs]);

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
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
          <Link href="/chat">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
        {shortsData.map((reel, index) => (
          <div
            key={reel.id}
            ref={(el) => (reelRefs.current[index] = el)}
            data-index={index}
            className="h-full w-full snap-start"
          >
            <ReelItem
              reel={reel}
              isVisible={index === visibleReelIndex}
              isMuted={isMuted}
              toggleMute={() => setIsMuted(prev => !prev)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
