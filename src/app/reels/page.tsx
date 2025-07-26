
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

// Bu veriler normalde API'den gelirdi, ancak kota kullanımı ve tutarlılık için statik olarak burada.
const shortsData: Reel[] = [
    { id: 'ctQQ8z7nd0k', videoUrl: 'https://www.youtube.com/shorts/ctQQ8z7nd0k', description: 'GigaChad phonk music', author: { nickname: 'Music Lover', avatar: '' }},
    { id: 'KxOMK9P2z7k', videoUrl: 'https://www.youtube.com/shorts/KxOMK9P2z7k', description: 'Roblox Egor Edit', author: { nickname: 'RobloxFan', avatar: '' }},
    { id: '0aebz9j5Gow', videoUrl: 'https://www.youtube.com/shorts/0aebz9j5Gow', description: 'How to make a working car in Roblox', author: { nickname: 'Roblox Tutorials', avatar: '' }},
    { id: '915e7wVn2s8', videoUrl: 'https://www.youtube.com/shorts/915e7wVn2s8', description: 'Another Sigma Edit', author: { nickname: 'EditMaster', avatar: '' }},
    { id: 'CIW9_2k-a8A', videoUrl: 'https://www.youtube.com/shorts/CIW9_2k-a8A', description: 'Funny Roblox Moment', author: { nickname: 'GameClips', avatar: '' }},
    { id: '2Vv-BfVoq4g', videoUrl: 'https://www.youtube.com/shorts/2Vv-BfVoq4g', description: 'Minecraft Parkour Skills', author: { nickname: 'MinecraftPro', avatar: '' }},
    { id: 'mDajb59a6wE', videoUrl: 'https://www.youtube.com/shorts/mDajb59a6wE', description: 'Cool Phonk Edit', author: { nickname: 'Editor', avatar: '' }},
    { id: 'L7-TjSg0z_s', videoUrl: 'https://www.youtube.com/shorts/L7-TjSg0z_s', description: 'Roblox Obby Tutorial', author: { nickname: 'Gamer', avatar: '' }},
    { id: 'X_3gA8a33uk', videoUrl: 'https://www.youtube.com/shorts/X_3gA8a33uk', description: 'GigaChad walking', author: { nickname: 'ChadWalker', avatar: '' }},
];

function ReelItem({ reel, isVisible, player, setPlayer }: { reel: Reel; isVisible: boolean; player: YouTubePlayer | null; setPlayer: (player: YouTubePlayer | null) => void; }) {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isVisible && player) {
      player.playVideo();
    } else if (player) {
      player.pauseVideo();
    }
  }, [isVisible, player]);

  const onReady = (event: { target: YouTubePlayer }) => {
    setPlayer(event.target);
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
  };
  
  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      loop: 1,
      playlist: reel.id, // Required for loop
      playsinline: 1,
    },
  };

  return (
    <section className="relative h-full w-full snap-start flex items-center justify-center">
      {isVisible && (
         <YouTube
            videoId={reel.id}
            opts={opts}
            onReady={onReady}
            className="w-full h-full object-contain absolute inset-0"
         />
      )}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-10" onClick={toggleMute}>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="flex items-end justify-between">
            <div className="max-w-[calc(100%-60px)] flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white/50">
                <AvatarImage src={reel.author.avatar} />
                <AvatarFallback>{getInitials(reel.author.nickname)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold truncate">{reel.author.nickname}</h3>
                <p className="text-sm line-clamp-2">{reel.description}</p>
              </div>
            </div>
             {/* We use stopPropagation to prevent the mute toggle when clicking the share button */}
            <div onClick={(e) => e.stopPropagation()}>
                <ShareReelSheet reel={reel}>
                    <Button variant="ghost" size="icon">
                        <Send className="h-6 w-6" />
                    </Button>
                </ShareReelSheet>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             {isMuted ? <VolumeX className="h-12 w-12 text-white/50" /> : <Volume2 className="h-12 w-12 text-white/50" />}
        </div>
      </div>
    </section>
  );
}

function ReelsFeed() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [visibleReelIndex, setVisibleReelIndex] = useState(0);
  const reelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
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

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      reelRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [shortsData]);

  if (!shortsData || shortsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Videolar Yüklenemedi</h2>
        <p className="text-center text-muted-foreground mb-6">
          Videolar çekilemedi. Lütfen daha sonra tekrar deneyin.
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat">
            <ArrowLeft className="h-6 w-6 text-white" />
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
              player={player}
              setPlayer={setPlayer}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReelsPage() {
    // We need to add the react-youtube package
    // But since this is a server component, we need a client wrapper
    // to add dependencies
    return <ReelsFeed />;
}
