
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { createOrGetRoom } from '@/lib/rooms';

interface Friend {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function RoomList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    // Start loading whenever auth state changes
    setLoadingFriends(true);

    // If auth is still loading, or there's no user, wait.
    if (authLoading || !user) {
      // If auth is done and there's still no user, stop loading.
      if (!authLoading) {
        setLoadingFriends(false);
      }
      return;
    }
    
    // Once we have a user, start fetching friends.
    const friendsQuery = query(collection(db, 'users', user.uid, 'friends'));

    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
        const friendsList = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        })) as Friend[];
        setFriends(friendsList);
        setLoadingFriends(false); // We have a result (even if empty), stop loading.
    }, (error) => {
        console.error("Error fetching friends: ", error);
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Arkadaşlar yüklenemedi.',
        });
        setLoadingFriends(false); // Stop loading on error too.
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const handleSelectFriendForDM = async (selectedFriend: Friend) => {
    if (!user) return;
    
    setOpenMobile(false);
    const roomId = await createOrGetRoom(user, selectedFriend);
    router.push(`/chat/${roomId}`);
  };
  
  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Arkadaşlar</h2>
        <Button variant="ghost" size="icon" onClick={() => router.push('/find-friends')}>
            <Search className="h-5 w-5" />
        </Button>
      </div>
      
       <nav className="flex flex-col gap-1 flex-1 overflow-auto">
        {loadingFriends ? (
          <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : friends.length > 0 ? (
            friends.map((friend) => {
              const dmRoomId = user && (user.uid > friend.uid ? `${user.uid}_${friend.uid}` : `${friend.uid}_${user.uid}`);
              return (
                <button
                    key={friend.uid}
                    onClick={() => handleSelectFriendForDM(friend)}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary w-full text-left',
                        pathname === `/chat/${dmRoomId}` && 'bg-secondary text-primary font-semibold'
                    )}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.photoURL || ''} alt={friend.displayName} />
                        <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                    </Avatar>
                    {friend.displayName}
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
