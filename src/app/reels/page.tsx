
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import ShareReelSheet from '@/components/reels/ShareReelSheet';

// We will embed the YouTube Short directly using an iframe.
const YOUTUBE_SHORT_ID = 'ctQQ8z7nd0k';
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_SHORT_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_SHORT_ID}&controls=0&showinfo=0&modestbranding=1`;

// Dummy reel data for the ShareReelSheet component
const testReel = {
    id: YOUTUBE_SHORT_ID,
    videoUrl: `https://www.youtube.com/shorts/${YOUTUBE_SHORT_ID}`,
    description: 'A great short video!',
    author: {
        nickname: 'YouTube Creator',
        avatar: 'https://placehold.co/100x100.png',
    },
};

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

            <div className="h-full w-full snap-y snap-mandatory">
                <section className="relative h-full w-full snap-start flex items-center justify-center">
                    <iframe
                        src={YOUTUBE_EMBED_URL}
                        title="YouTube video player"
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
                                    <AvatarImage src={testReel.author.avatar} />
                                    <AvatarFallback>{getInitials(testReel.author.nickname)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold truncate">{testReel.author.nickname}</h3>
                                    <p className="text-sm line-clamp-2">{testReel.description}</p>
                                </div>
                            </div>
                            <ShareReelSheet reel={testReel}>
                                <Button variant="ghost" size="icon">
                                    <Send className="h-6 w-6" />
                                </Button>
                            </ShareReelSheet>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function ReelsPage() {
    return <ReelsFeed />;
}
