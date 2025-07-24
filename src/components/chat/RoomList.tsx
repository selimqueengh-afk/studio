
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Plus, Hash, Loader2, User as UserIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';


interface Room {
  id: string;
  name: string;
  creatorId: string;
  isDirectMessage?: boolean;
  participants?: string[];
  participantNames?: { [key: string]: string };
  participantPhotos?: { [key: string]: string | null };
}

interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function RoomList() {
  const { user } = useAuth();
  const router = useRouter();
  const [groupRooms, setGroupRooms] = useState<Room[]>([]);
  const [directMessageRooms, setDirectMessageRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [isGroupRoomDialogOpen, setGroupRoomDialogOpen] = useState(false);
  const [isDMDialogOpen, setDMDialogOpen] = useState(false);
  const [isCreatingRoom, setCreatingRoom] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    if (!user) return;
    const roomsQuery = query(collection(db, 'rooms'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      roomsQuery,
      (snapshot) => {
        const allRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Room, 'id'>)
        }));

        setGroupRooms(allRooms.filter(room => !room.isDirectMessage));
        setDirectMessageRooms(allRooms.filter(room => room.isDirectMessage && room.participants?.includes(user.uid)));
        
        setLoadingRooms(false);
      },
      (error) => {
        console.error("Error fetching rooms: ", error);
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Sohbet odaları yüklenemedi.',
        });
        setLoadingRooms(false);
      }
    );
    return () => unsubscribe();
  }, [toast, user]);

  useEffect(() => {
    if (!user) return;
    const usersQuery = query(collection(db, 'users'), where('uid', '!=', user.uid));
    const unsubscribe = onSnapshot(
        usersQuery,
        (snapshot) => {
            const usersData = snapshot.docs.map(doc => doc.data() as User);
            setUsers(usersData);
            setLoadingUsers(false);
        },
        (error) => {
            console.error("Error fetching users: ", error);
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: 'Kullanıcılar yüklenemedi.',
            });
            setLoadingUsers(false);
        }
    );
    return () => unsubscribe();
  }, [toast, user]);


  const handleCreateGroupRoom = async () => {
    if (newRoomName.trim() === '' || !user) return;
    setCreatingRoom(true);
    try {
      await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        createdAt: serverTimestamp(),
        creatorId: user.uid,
        isDirectMessage: false,
      });
      setNewRoomName('');
      setGroupRoomDialogOpen(false);
      toast({ title: 'Başarılı', description: 'Yeni grup odası oluşturuldu.' });
    } catch (error) {
      console.error('Error creating room: ', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Grup odası oluşturulamadı.',
      });
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleSelectUserForDM = async (selectedUser: User) => {
    if (!user) return;
    
    setDMDialogOpen(false);
    setOpenMobile(false);

    const currentUserUid = user.uid;
    const selectedUserUid = selectedUser.uid;

    // Create a consistent, unique ID for the direct message room
    const chatId = currentUserUid > selectedUserUid
        ? `${currentUserUid}_${selectedUserUid}`
        : `${selectedUserUid}_${currentUserUid}`;
    
    const chatDocRef = doc(db, 'rooms', chatId);
    const chatDoc = await getDoc(chatDocRef);

    // Create the DM room if it doesn't exist
    if (!chatDoc.exists()) {
        await setDoc(chatDocRef, {
            name: `DM with ${selectedUser.displayName}`, // This name is internal, won't be displayed
            createdAt: serverTimestamp(),
            creatorId: user.uid, // or null, depends on your logic
            isDirectMessage: true,
            participants: [currentUserUid, selectedUserUid],
            participantNames: {
                [currentUserUid]: user.displayName,
                [selectedUserUid]: selectedUser.displayName
            },
            participantPhotos: {
                [currentUserUid]: user.photoURL,
                [selectedUserUid]: selectedUser.photoURL
            }
        });
    }
    router.push(`/chat/${chatId}`);
  };
  
  const getOtherParticipant = (room: Room) => {
      if (!user || !room.participants || !room.participantNames || !room.participantPhotos) return { name: 'DM', photo: '' };
      const otherUserId = room.participants.find(uid => uid !== user.uid);
      if (!otherUserId) return { name: 'DM', photo: '' };

      return {
          name: room.participantNames[otherUserId] || 'Bilinmeyen Kullanıcı',
          photo: room.participantPhotos[otherUserId] || ''
      };
  }

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
        <h2 className="text-lg font-semibold text-foreground">Odalar</h2>
        <Dialog open={isGroupRoomDialogOpen} onOpenChange={setGroupRoomDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Grup Odası</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Oda adı"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleCreateGroupRoom} disabled={isCreatingRoom}>
                {isCreatingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loadingRooms ? (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 w-full rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : (
        <nav className="flex flex-col gap-1">
          {groupRooms.map((room) => (
            <Link
            key={room.id}
            href={`/chat/${room.id}`}
            onClick={() => setOpenMobile(false)}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary',
                pathname === `/chat/${room.id}` && 'bg-secondary text-primary font-semibold'
            )}
            >
            <Hash className="h-4 w-4" />
            {room.name}
            </Link>
          ))}
        </nav>
      )}
      <Separator className="my-4" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Direkt Mesajlar</h2>
        <Dialog open={isDMDialogOpen} onOpenChange={setDMDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Yeni Mesaj</DialogTitle>
                </DialogHeader>
                {loadingUsers ? (
                     <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin" />
                ) : (
                <ScrollArea className="h-72">
                    <div className="flex flex-col gap-1">
                        {users.map((u) => (
                            <button
                                key={u.uid}
                                onClick={() => handleSelectUserForDM(u)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary w-full text-left"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.photoURL || ''} alt={u.displayName || ''} />
                                    <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                                </Avatar>
                                {u.displayName}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
      </div>

       <nav className="flex flex-col gap-1 flex-1 overflow-auto">
        {loadingRooms ? (
          <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-full rounded-md bg-muted animate-pulse" />)}
          </div>
        ) : directMessageRooms.length > 0 ? (
            directMessageRooms.map((room) => {
              const otherParticipant = getOtherParticipant(room);
              return (
                <Link
                    key={room.id}
                    href={`/chat/${room.id}`}
                    onClick={() => setOpenMobile(false)}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary w-full text-left',
                        pathname === `/chat/${room.id}` && 'bg-secondary text-primary font-semibold'
                    )}
                >
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={otherParticipant.photo} alt={otherParticipant.name} />
                        <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                    </Avatar>
                    {otherParticipant.name}
                </Link>
              )
            })
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
             Hiç direkt mesajınız yok.
          </div>
        )}
        </nav>
    </div>
  );
}
