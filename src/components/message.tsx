
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface MessageProps {
  message: {
    text: string;
    createdAt: any;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
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

  return (
    <div
      className={cn(
        'flex items-start gap-3 my-4',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Link href={`/profile/${message.userId}`}>
          <Avatar>
            <AvatarImage src={message.userPhotoURL || ''} />
            <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
          </Avatar>
      </Link>
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
        <div
          className={cn(
            'rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg break-words shadow',
            isCurrentUser
              ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
              : 'bg-card border'
          )}
        >
          <p>{message.text}</p>
        </div>
      </div>
    </div>
  );
}
