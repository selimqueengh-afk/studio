
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { Bell, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { acceptFriendRequest, rejectFriendRequest } from '@/lib/friends';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';

interface FriendRequest {
    id: string;
    from: string;
    fromName?: string;
    fromPhotoURL?: string;
}

export default function FriendRequestBell() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;

        const requestsQuery = query(
            collection(db, 'friendRequests'),
            where('to', '==', user.uid),
            where('status', '==', 'pending')
        );
        
        const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
            const requestsPromises = snapshot.docs.map(async (requestDoc) => {
                const requestData = requestDoc.data();
                if (!requestData.from) {
                    return null;
                }
                const userDocSnap = await getDoc(doc(db, 'users', requestData.from));
                if (!userDocSnap.exists()) {
                    return null;
                }
                const userData = userDocSnap.data();
                return {
                    id: requestDoc.id,
                    from: requestData.from,
                    fromName: userData?.displayName,
                    fromPhotoURL: userData?.photoURL
                } as FriendRequest;
            });
            const newRequests = (await Promise.all(requestsPromises)).filter(Boolean) as FriendRequest[];
            setRequests(newRequests);
        });

        return () => unsubscribe();

    }, [user]);

    const handleAccept = async (fromUid: string) => {
        if(!user) return;
        setIsUpdating(fromUid);
        try {
            await acceptFriendRequest(fromUid, user.uid);
            toast({ title: "Kabul Edildi", description: "Arkadaşlık isteğini kabul ettiniz." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Hata", description: (error as Error).message || "İstek kabul edilemedi." });
        }
        setIsUpdating(null);
    };

    const handleReject = async (fromUid: string) => {
        if(!user) return;
        setIsUpdating(fromUid);
        try {
            await rejectFriendRequest(fromUid, user.uid);
            toast({ title: "Reddedildi", description: "Arkadaşlık isteğini reddettiniz." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Hata", description: (error as Error).message || "İstek reddedilemedi." });
        }
        setIsUpdating(null);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {requests.length > 0 && (
                         <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                           {requests.length}
                         </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                 <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Arkadaşlık İstekleri</h4>
                        <p className="text-sm text-muted-foreground">
                           Yeni arkadaşlık isteklerinizi yönetin.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {requests.length > 0 ? requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={req.fromPhotoURL} />
                                        <AvatarFallback>{getInitials(req.fromName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium truncate">{req.fromName || 'Bilinmeyen Kullanıcı'}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => handleAccept(req.from)} disabled={!!isUpdating}>
                                        {isUpdating === req.from ? <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"/> : <UserCheck className="h-4 w-4"/>}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleReject(req.from)} disabled={!!isUpdating}>
                                       {isUpdating === req.from ? <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"/> : <UserX className="h-4 w-4"/>}
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-center text-muted-foreground p-4">Yeni istek yok.</p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
