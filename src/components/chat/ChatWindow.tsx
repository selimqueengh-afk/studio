
"use client";

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface MessageData {
  id: string;
  text: string;
  createdAt: any;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
}

interface RoomData {
  name: string;
  creatorId: string;
  isDirectMessage?: boolean;
  participants?: string[];
  participantNames?: { [key: string]: string };
  participantPhotos?: { [key: string]: string | null };
}

export default function ChatWindow({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const otherParticipantId = room?.participants?.find(p => p !== user?.uid);
  const otherParticipantName = otherParticipantId ? room?.participantNames?.[otherParticipantId] : null;
  const otherParticipantPhoto = otherParticipantId ? room?.participantPhotos?.[otherParticipantId] : null;

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const roomDoc = await getDoc(doc(db, 'rooms', roomId));
      if (roomDoc.exists()) {
        const roomData = roomDoc.data() as RoomData;
        if (roomData.isDirectMessage && !roomData.participants?.includes(user?.uid || '')) {
             toast({ variant: 'destructive', title: 'Yetkisiz', description: 'Bu sohbete erişim izniniz yok.'});
             router.push('/chat');
             return;
        }
        setRoom(roomData);
      } else {
        toast({ variant: 'destructive', title: 'Hata', description: 'Sohbet odası bulunamadı.' });
        router.push('/chat');
      }
    };
    fetchRoom();

    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageData[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Mesajlar alınırken hata oluştu: ", error);
      toast({ variant: 'destructive', title: 'Hata', description: 'Mesajlar yüklenemedi.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, router, toast, user?.uid]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
             setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages]);

   const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };


  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 shrink-0 border-b bg-card px-6">
            <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
           <div className="flex items-start flex-row-reverse gap-2.5">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2 items-end flex flex-col">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </div>
        <div className="border-t p-4"><Skeleton className="h-12 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
       <header className="flex items-center justify-between h-16 shrink-0 border-b bg-card px-6">
        <Link href={`/profile/${otherParticipantId}`} className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg transition-colors">
            <Avatar className="h-9 w-9">
                <AvatarImage src={otherParticipantPhoto || ''} alt={otherParticipantName || ''} />
                <AvatarFallback>{getInitials(otherParticipantName)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{otherParticipantName || room?.name || 'Sohbet'}</h2>
        </Link>
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                  isCurrentUser={user?.uid === msg.userId}
                />
              ))
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Sohbeti başlatmak için bir mesaj gönderin!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t bg-card p-4">
        <MessageInput roomId={roomId} />
      </div>
    </div>
  );
}

