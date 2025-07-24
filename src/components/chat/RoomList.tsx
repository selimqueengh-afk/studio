
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, getDoc, setDoc, serverTimestamp, query } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Hash, Loader2, User as UserIcon, MessageSquare, Users, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

interface Friend {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function RoomList() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    if (!user) return;
    setLoadingFriends(true);
    const friendsRef = ref(rtdb, `friends/${user.uid}`);
    
    const unsubscribe = onValue(friendsRef, (snapshot) => {
        const friendsData = snapshot.val();
        if (friendsData) {
            const friendsList = Object.keys(friendsData).map(key => ({
                uid: key,
                ...friendsData[key]
            } as Friend));
            setFriends(friendsList);
        } else {
            setFriends([]);
        }
        setLoadingFriends(false);
    }, (error) => {
        console.error("Error fetching friends: ", error);
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Arkadaşlar yüklenemedi.',
        });
        setLoadingFriends(false);
    });

    return () => unsubscribe();
  }, [toast, user]);


  const handleSelectFriendForDM = async (selectedFriend: Friend) => {
    if (!user) return;
    
    setOpenMobile(false);

    const currentUserUid = user.uid;
    const selectedUserUid = selectedFriend.uid;

    const chatId = currentUserUid > selectedUserUid
        ? `${currentUserUid}_${selectedUserUid}`
        : `${selectedUserUid}_${currentUserUid}`;
    
    const chatDocRef = doc(db, 'rooms', chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (!chatDoc.exists()) {
        await setDoc(chatDocRef, {
            name: `DM with ${selectedFriend.displayName}`,
            createdAt: serverTimestamp(),
            isDirectMessage: true,
            participants: {
              [currentUserUid]: true,
              [selectedUserUid]: true,
            },
            participantNames: {
                [currentUserUid]: user.displayName,
                [selectedUserUid]: selectedFriend.displayName
            },
            participantPhotos: {
                [currentUserUid]: user.photoURL,
                [selectedUserUid]: selectedFriend.photoURL
            }
        });
    }
    router.push(`/chat/${chatId}`);
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
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
