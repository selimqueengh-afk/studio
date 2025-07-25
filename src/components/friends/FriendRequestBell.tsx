
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/friends';

interface FriendRequest {
  id: string;
  from: string;
  fromName: string;
  fromPhoto: string | null;
  to: string;
  toName: string;
  toPhoto: string | null;
}

export default function FriendRequestBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setRequests([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'friendRequests'), where('to', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setRequests(reqs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching friend requests:", error);
      toast({ variant: 'destructive', title: 'Hata', description: 'Arkadaşlık istekleri yüklenemedi.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleAccept = async (request: FriendRequest) => {
    if (!user) return;
    setActionLoading(request.id);
    const fromUser = { uid: request.from, displayName: request.fromName, email: '', photoURL: request.fromPhoto || undefined };
    const toUser = { uid: request.to, displayName: request.toName, email: user.email || '', photoURL: request.toPhoto || undefined };

    try {
      await acceptFriendRequest(request.id, fromUser, toUser);
      toast({ title: 'Başarılı', description: `${request.fromName} artık arkadaşın.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message || 'İstek kabul edilemedi.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await rejectFriendRequest(requestId);
      toast({ title: 'Reddedildi', description: 'Arkadaşlık isteği reddedildi.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message || 'İstek reddedilemedi.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {requests.length > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Arkadaşlık İstekleri</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          Arkadaşlık İstekleri ({requests.length})
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="flex flex-col p-2 rounded-lg hover:bg-secondary">
                 <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={req.fromPhoto || undefined} alt={req.fromName} />
                        <AvatarFallback>{getInitials(req.fromName)}</AvatarFallback>
                    </Avatar>
                    <p className="flex-1 font-semibold truncate">{req.fromName}</p>
                 </div>
                 <div className="flex gap-2 mt-2 self-end">
                    <Button size="sm" onClick={() => handleAccept(req)} disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 className="animate-spin h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 className="animate-spin h-4 w-4" /> : <UserX className="h-4 w-4" />}
                    </Button>
                 </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">
              Yeni arkadaşlık isteği yok.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
