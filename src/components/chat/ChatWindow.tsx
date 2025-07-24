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
}

export default function ChatWindow({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const roomDoc = await getDoc(doc(db, 'rooms', roomId));
      if (roomDoc.exists()) {
        setRoom(roomDoc.data() as RoomData);
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Sohbet odası bulunamadı.',
        });
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
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Mesajlar yüklenemedi.',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, router, toast]);

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

  const handleDeleteRoom = async () => {
    if (!room || !user || room.creatorId !== user.uid) {
        toast({
            variant: 'destructive',
            title: 'Yetkisiz',
            description: 'Bu odayı silme yetkiniz yok.',
        });
        return;
    }

    if (!window.confirm('Bu odayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
    }

    setIsDeleting(true);
    try {
      const messagesCollection = collection(db, 'rooms', roomId, 'messages');
      const messagesSnapshot = await getDocs(messagesCollection);
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();

      await deleteDoc(doc(db, 'rooms', roomId));
      
      toast({ title: 'Başarılı', description: 'Oda ve tüm mesajlar silindi.' });
      router.push('/chat');
    } catch (error) {
      console.error("Oda silinirken hata oluştu: ", error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Oda silinemedi. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 max-w-md mx-auto w-full">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="flex-1 space-y-4">
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
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col max-w-md mx-auto w-full">
       <header className="flex items-center justify-between h-16 shrink-0 border-b bg-card px-6">
        <h2 className="text-lg font-semibold">{room?.name || 'Sohbet'}</h2>
        {user && room && user.uid === room.creatorId && (
          <Button variant="destructive" size="icon" onClick={handleDeleteRoom} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="sr-only">Odayı Sil</span>
          </Button>
        )}
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
