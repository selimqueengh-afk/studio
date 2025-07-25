
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { StaticReel } from '@/lib/reels';
import ReelCard from '../reels/ReelCard';

interface MessageProps {
  message: {
    id: string;
    text?: string;
    createdAt: any;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    type?: 'text' | 'reel';
    reel?: StaticReel;
  };
  isCurrentUser: boolean;
}

export default function Message({ message, isCurrentUser }: MessageProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');

  const timestamp = message.createdAt?.toDate();
  const formattedTime = timestamp ? format(timestamp, 'HH:mm') : '';

  const renderMessageContent = () => {
    if (message.type === 'reel' && message.reel) {
        return <ReelCard reel={message.reel} isShared={true} />;
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
    )
  }

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
