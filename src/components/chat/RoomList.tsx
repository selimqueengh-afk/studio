
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { createOrGetRoom } from '@/lib/rooms';
import { usePathname } from 'next/navigation';

interface RoomParticipant {
    uid: string;
    displayName: string;
    photoURL?: string;
}

interface Room {
    id: string;
    otherParticipant: RoomParticipant | null;
}

export default function RoomList() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    if (!user) {
      setLoadingRooms(false);
      setRooms([]);
      return;
    }

    setLoadingRooms(true);
    const roomsQuery = query(collection(db, 'rooms'));

    const unsubscribe = onSnapshot(roomsQuery, async (snapshot) => {
        const userRooms: Room[] = [];
        const userDocs = new Map<string, RoomParticipant>();

        for (const roomDoc of snapshot.docs) {
            const roomData = roomDoc.data();
            const participants = roomData.participants || {};

            if (participants[user.uid]) {
                const otherParticipantId = Object.keys(participants).find(p => p !== user.uid);
                
                let otherParticipant: RoomParticipant | null = null;
                if (otherParticipantId) {
                    if (userDocs.has(otherParticipantId)) {
                        otherParticipant = userDocs.get(otherParticipantId)!;
                    } else {
                        const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", otherParticipantId)));
                        if (!userDoc.empty) {
                           const userData = userDoc.docs[0].data();
                           otherParticipant = {
                               uid: userData.uid,
                               displayName: userData.displayName,
                               photoURL: userData.photoURL
                           };
                           userDocs.set(otherParticipantId, otherParticipant);
                        }
                    }
                }
                userRooms.push({ id: roomDoc.id, otherParticipant });
            }
        }
        
        setRooms(userRooms);
        setLoadingRooms(false);
    }, (error) => {
        console.error("Error fetching rooms: ", error);
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Sohbetler yüklenemedi.',
        });
        setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, [user, toast]);


  const handleSelectRoom = (roomId: string) => {
    setOpenMobile(false);
    router.push(`/chat/${roomId}`);
  };
  
  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Sohbetler</h2>
        <Button variant="ghost" size="icon" onClick={() => router.push('/find-friends')}>
            <UserPlus className="h-5 w-5" />
        </Button>
      </div>
      
       <nav className="flex flex-col gap-1 flex-1 overflow-auto">
        {loadingRooms ? (
          <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rooms.length > 0 ? (
            rooms.map((room) => {
              if (!room.otherParticipant) return null;
              return (
                <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary w-full text-left',
                        pathname === `/chat/${room.id}` && 'bg-secondary text-primary font-semibold'
                    )}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={room.otherParticipant.photoURL || ''} alt={room.otherParticipant.displayName} />
                        <AvatarFallback>{getInitials(room.otherParticipant.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{room.otherParticipant.displayName}</span>
                </button>
              )
            })
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
             Henüz sohbetiniz yok.
          </div>
        )}
        </nav>
    </div>
  );
}
