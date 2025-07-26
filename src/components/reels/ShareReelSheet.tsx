
"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetTrigger
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { createOrGetRoom } from '@/lib/rooms';
import { Reel } from '@/lib/reels';


interface Friend {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

interface ShareReelSheetProps {
    reel: Reel;
    children: ReactNode; // To trigger the sheet
}

export default function ShareReelSheet({ reel, children }: ShareReelSheetProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [sending, setSending] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !isOpen) return;
        setLoadingFriends(true);
        
        const friendsQuery = query(collection(db, 'users', user.uid, 'friends'));

        const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
            const friendsList = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as Friend[];
            setFriends(friendsList);
            setLoadingFriends(false);
        }, (error) => {
            console.error("Error fetching friends: ", error);
            setLoadingFriends(false);
        });

        return () => unsubscribe();
    }, [user, isOpen]);
    
    const handleShare = async (friend: Friend) => {
        if (!user) return;
        setSending(friend.uid);

        try {
            const currentUserInfo = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            }
            const roomId = await createOrGetRoom(currentUserInfo, friend);
            
            await addDoc(collection(db, 'rooms', roomId, 'messages'), {
                type: 'reel',
                reel: reel, // Pass the whole reel object
                createdAt: serverTimestamp(),
                userId: user.uid,
                userName: user.displayName,
                userPhotoURL: user.photoURL,
            });

            toast({
                title: 'Gönderildi!',
                description: `${friend.displayName} adlı kullanıcıya video gönderildi.`,
            });
            setIsOpen(false);

        } catch (error) {
            console.error("Error sharing reel: ", error);
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: 'Video gönderilemedi.',
            });
        } finally {
            setSending(null);
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Bir arkadaşınla paylaş</SheetTitle>
                    <SheetDescription>
                        Bu videoyu göndermek için bir arkadaşını seç.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                    <div className="flex flex-col gap-2 p-1">
                        {loadingFriends ? (
                             <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : friends.length > 0 ? (
                            friends.map((friend) => (
                                <div key={friend.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={friend.photoURL || ''} alt={friend.displayName}/>
                                            <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{friend.displayName}</span>
                                    </div>
                                    <Button size="sm" onClick={() => handleShare(friend)} disabled={!!sending}>
                                        {sending === friend.uid ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        Gönder
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">Paylaşacak arkadaş bulunamadı.</p>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )

}
