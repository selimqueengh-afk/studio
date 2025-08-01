
"use client";

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { createOrGetRoom } from '@/lib/rooms';
import { Reel } from '@/lib/reels';


interface MessageData {
  id: string;
  text?: string;
  createdAt: any;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  type?: 'text' | 'reel';
  reel?: Reel;
}

interface RoomData {
  name: string;
  creatorId: string;
  isDirectMessage?: boolean;
  participants?: { [key:string]: boolean };
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

  const otherParticipantId = room?.participants ? Object.keys(room.participants).find(p => p !== user?.uid) : undefined;
  const otherParticipantName = otherParticipantId ? room?.participantNames?.[otherParticipantId] : null;
  const otherParticipantPhoto = otherParticipantId ? room?.participantPhotos?.[otherParticipantId] : null;

  useEffect(() => {
    if (!user?.uid) return;

    const setupChat = async () => {
      setLoading(true);
      try {
        let roomDoc = await getDoc(doc(db, 'rooms', roomId));
        
        // "Lazy" room creation: if the room doesn't exist, create it now.
        if (!roomDoc.exists()) {
            const participantIds = roomId.split('_');
            const otherUserId = participantIds.find(id => id !== user.uid);
            if (!otherUserId) {
                throw new Error("Invalid room ID for room creation.");
            }
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            if (!otherUserDoc.exists()) {
                 throw new Error("Chat participant not found.");
            }
            
            await createOrGetRoom(user, otherUserDoc.data());
            // Fetch the room doc again after creation
            roomDoc = await getDoc(doc(db, 'rooms', roomId));
        }


        if (roomDoc.exists()) {
          const roomData = roomDoc.data() as RoomData;
           if (roomData.participants && !roomData.participants[user.uid]) {
             toast({ variant: 'destructive', title: 'Yetkisiz', description: 'Bu sohbete erişim izniniz yok.'});
             router.push('/chat');
             return;
          }
          setRoom(roomData);
        } else {
          toast({ variant: 'destructive', title: 'Hata', description: 'Sohbet odası bulunamadı.' });
          router.push('/chat');
          return; // Stop execution if room isn't found even after trying to create
        }
      } catch (error) {
          console.error("Error fetching or creating room: ", error);
          toast({ variant: 'destructive', title: 'Hata', description: 'Sohbet odası yüklenemedi.' });
          router.push('/chat');
          return;
      }

      // If setup is successful, listen for messages
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
        setLoading(false); // Set loading to false only after messages are loaded
      }, (error) => {
        console.error("Mesajlar alınırken hata oluştu: ", error);
        toast({ variant: 'destructive', title: 'Hata', description: 'Mesajlar yüklenemedi.' });
        setLoading(false);
      });

      return unsubscribe;
    };
    
    const unsubscribePromise = setupChat();

    return () => {
        unsubscribePromise.then(unsub => {
            if (unsub) {
                unsub();
            }
        })
    };
  }, [roomId, router, toast, user]);

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


  if (loading || !room) {
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
