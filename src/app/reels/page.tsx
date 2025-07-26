
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { type Reel } from '@/lib/reels';
import { fetchYouTubeShorts } from '@/lib/youtube';


async function ReelsFeed() {
  // Videoları saatte bir kez sunucu tarafında çek.
  // Bu, API kotasını büyük ölçüde korur.
  const shortsData = await fetchYouTubeShorts();

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
        {shortsData.map((reel, index) => {
          // YouTube'un gömme (embed) URL'sini oluştur.
          // autoplay=1 -> otomatik oynat
          // loop=1 -> döngüye al
          // playlist=${reel.id} -> döngü için gerekli
          // controls=0 -> oynatıcı kontrollerini gizle
          // Sesi açmak için mute=1 parametresini kaldırdık.
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
