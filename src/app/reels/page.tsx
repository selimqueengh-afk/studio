
import { fetchTiktokFeed } from '@/lib/tiktok';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function ReelsFeed() {
    const feed = await fetchTiktokFeed();

    // The error message is removed because we now use a reliable static list.
    // The feed should always load correctly.
    if (!feed || feed.length === 0) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center text-white bg-black p-4 text-center">
                <p className="text-lg font-semibold">Videolar hazırlanıyor...</p>
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

            <div className="h-full w-full overflow-y-auto snap-y snap-mandatory">
                {feed.map((reel) => (
                    <section key={reel.id} className="relative h-full w-full snap-start flex items-center justify-center">
                        <video
                            src={reel.videoUrl}
                            controls
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                            poster={reel.author.avatar}
                        >
                            Tarayıcınız video etiketini desteklemiyor.
                        </video>
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
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
                                <ShareReelSheet reel={reel}>
                                    <Button variant="ghost" size="icon">
                                        <Send className="h-6 w-6" />
                                    </Button>
                                </ShareReelSheet>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default function ReelsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black text-white">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p>Videolar Yükleniyor...</p>
            </div>
        }>
            <ReelsFeed />
        </Suspense>
    );
}
