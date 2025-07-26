
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Reel } from '@/lib/reels';
import { getInitials } from '@/lib/utils';

interface MessageProps {
  message: {
    id: string;
    text?: string;
    createdAt: any;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    type?: 'text' | 'reel';
    reel?: Reel;
  };
  isCurrentUser: boolean;
}

export default function Message({ message, isCurrentUser }: MessageProps) {

  const timestamp = message.createdAt?.toDate();
  const formattedTime = timestamp ? format(timestamp, 'HH:mm') : '';

  const renderMessageContent = () => {
    if (message.type === 'reel' && message.reel) {
        const youtubeEmbedUrl = message.reel.videoUrl.includes('embed') 
        ? message.reel.videoUrl
        : `https://www.youtube.com/embed/${message.reel.id}?autoplay=0&controls=1&modestbranding=1`;

      return (
        <div className="relative w-64 rounded-lg border bg-card overflow-hidden group">
          <div className="aspect-video bg-black">
             <iframe
                src={youtubeEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-contain"
             ></iframe>
          </div>
          <div className="p-2">
            <p className="font-semibold text-sm truncate">@{message.reel.author.nickname}</p>
            <p className="text-xs text-muted-foreground truncate">{message.reel.description}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg break-words',
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border'
        )}
      >
        <p>{message.text}</p>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 my-4',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar>
        <AvatarImage src={message.userPhotoURL || ''} />
        <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'flex flex-col gap-1',
          isCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          {!isCurrentUser && (
            <span className="font-semibold">{message.userName}</span>
          )}
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
        
        {renderMessageContent()}
      </div>
    </div>
  );
}
