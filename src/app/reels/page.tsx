
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { type Reel } from '@/lib/reels';

// API kullanmadan, statik olarak tanımlanmış YouTube Shorts verileri.
// Bu yaklaşım SIFIR API kotası harcar.
const shortsData: Reel[] = [
  {
    id: 'ctQQ8z7nd0k',
    videoUrl: 'https://www.youtube.com/shorts/ctQQ8z7nd0k',
    description: 'This is a great short video!',
    author: {
      nickname: 'YouTube Creator',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'Jpe1B9hr_2k',
    videoUrl: 'https://www.youtube.com/shorts/Jpe1B9hr_2k',
    description: 'Amazing nature footage.',
    author: {
      nickname: 'NatureLover',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'y9t1b4Bq3Kw',
    videoUrl: 'https://www.youtube.com/shorts/y9t1b4Bq3Kw',
    description: 'Funny animal moments.',
    author: {
      nickname: 'Animal Planet',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'FTmdmLp6-4g',
    videoUrl: 'https://www.youtube.com/shorts/FTmdmLp6-4g',
    description: 'Tech review in 60 seconds.',
    author: {
      nickname: 'TechExplained',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'PAc5241nOhM',
    videoUrl: 'https://www.youtube.com/shorts/PAc5241nOhM',
    description: 'Quick cooking recipe.',
    author: {
      nickname: 'ChefLife',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'p1x6gL5zk2A',
    videoUrl: 'https://www.youtube.com/shorts/p1x6gL5zk2A',
    description: 'Incredible magic trick!',
    author: {
      nickname: 'MagicMaster',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'D0K6P4B5Z8w',
    videoUrl: 'https://www.youtube.com/shorts/D0K6P4B5Z8w',
    description: 'A day in the life.',
    author: {
      nickname: 'Vlogger',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'aJb3j9m2l0o',
    videoUrl: 'https://www.youtube.com/shorts/aJb3j9m2l0o',
    description: 'Travel diary from paradise.',
    author: {
      nickname: 'Wanderlust',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
  {
    id: 'Mv1SryJ3-x4',
    videoUrl: 'https://www.youtube.com/shorts/Mv1SryJ3-x4',
    description: 'Fitness motivation for today.',
    author: {
      nickname: 'FitFam',
      avatar: 'https://placehold.co/100x100.png',
    },
  },
];

function ReelsFeed() {
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
        {shortsData.map((reel, index) => {
          const youtubeEmbedUrl = `https://www.youtube.com/embed/${reel.id}?autoplay=1&loop=1&playlist=${reel.id}&controls=0&showinfo=0&modestbranding=1`;

          return (
            <section
              key={reel.id}
              className="relative h-full w-full snap-start flex items-center justify-center"
            >
              <iframe
                src={youtubeEmbedUrl}
                title={`YouTube video player ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-contain"
              ></iframe>
              <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                <div className="flex items-end justify-between">
                  <div className="max-w-[calc(100%-60px)] flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage src={reel.author.avatar} />
                      <AvatarFallback>
                        {getInitials(reel.author.nickname)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold truncate">
                        {reel.author.nickname}
                      </h3>
                      <p className="text-sm line-clamp-2">{reel.description}</p>
                    </div>
                  </div>
                  <ShareReelSheet reel={reel}>
                    <Button variant="ghost" size="icon">
                      <Send className="h-6 w-6" />
                    </Button>
                  </ShareReelSheet>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function ReelsPage() {
  return <ReelsFeed />;
}
