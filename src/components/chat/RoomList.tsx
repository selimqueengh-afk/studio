"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
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
import { Plus, Hash, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';


interface Room {
  id: string;
  name: string;
  creatorId: string;
}

export default function RoomList() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isCreatingRoom, setCreatingRoom] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Room, 'id'>)
        }));
        setRooms(roomsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching rooms: ", error);
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Sohbet odaları yüklenemedi.',
        });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const handleCreateRoom = async () => {
    if (newRoomName.trim() === '' || !user) return;
    setCreatingRoom(true);
    try {
      await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        createdAt: serverTimestamp(),
        creatorId: user.uid,
      });
      setNewRoomName('');
      setDialogOpen(false);
      toast({ title: 'Başarılı', description: 'Yeni oda oluşturuldu.' });
    } catch (error) {
      console.error('Error creating room: ', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Oda oluşturulamadı.',
      });
    } finally {
      setCreatingRoom(false);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Odalar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sohbet Odası</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Oda adı"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
                {isCreatingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 w-full rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : (
        <nav className="flex flex-col gap-1">
          {rooms.map((room) => (
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
    </div>
  );
}
