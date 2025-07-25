
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';

interface Friend {
    uid: string;
    displayName: string;
    photoURL?: string;
}

interface Room {
    id: string;
    otherParticipant: Friend | null;
}

export default function RoomList() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!user) {
      setLoadingFriends(false);
      return;
    }

    setLoadingFriends(true);
    const friendsQuery = query(collection(db, 'users', user.uid, 'friends'));
    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
      const friendsList = snapshot.docs.map(doc => doc.data() as Friend);
      setFriends(friendsList);
      setLoadingFriends(false);
    }, (error) => {
      console.error("Error fetching friends: ", error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Arkadaş listesi yüklenemedi.',
      });
      setLoadingFriends(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    if (!user || friends.length === 0) {
      setRooms([]);
      return;
    }
    
    const userRooms = friends.map(friend => {
        const roomId = user.uid > friend.uid
            ? `${user.uid}_${friend.uid}`
            : `${friend.uid}_${user.uid}`;
        return {
            id: roomId,
            otherParticipant: friend,
        };
    });
    setRooms(userRooms);

  }, [user, friends]);


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
        {loadingFriends ? (
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
             Henüz arkadaşınız yok.
          </div>
        )}
        </nav>
    </div>
  );
}
