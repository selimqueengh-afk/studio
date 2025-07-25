
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, getDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Search, ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { sendFriendRequest } from '@/lib/friends';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

type FriendshipStatus = 'not_friends' | 'friends' | 'request_sent' | 'loading';

export default function FindFriendsPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, FriendshipStatus>>({});
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const updateFriendshipStatus = useCallback(async (targetUserId: string) => {
        if (!currentUser) return;
        setFriendshipStatuses(prev => ({ ...prev, [targetUserId]: 'loading' }));
        
        const friendDocRef = doc(db, `users/${currentUser.uid}/friends/${targetUserId}`);
        const sentRequestDocRef = doc(db, `friendRequests/${currentUser.uid}_${targetUserId}`);

        const [friendSnap, sentSnap] = await Promise.all([
            getDoc(friendDocRef),
            getDoc(sentRequestDocRef)
        ]);

        if (friendSnap.exists()) {
            setFriendshipStatuses(prev => ({ ...prev, [targetUserId]: 'friends' }));
        } else if (sentSnap.exists()) {
            setFriendshipStatuses(prev => ({ ...prev, [targetUserId]: 'request_sent' }));
        } else {
            setFriendshipStatuses(prev => ({ ...prev, [targetUserId]: 'not_friends' }));
        }
    }, [currentUser]);


    useEffect(() => {
        if (authLoading || !currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const usersQuery = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
        
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
            setAllUsers(usersData);

            usersData.forEach(user => {
                updateFriendshipStatus(user.uid);
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({ variant: 'destructive', title: 'Hata', description: 'Kullanıcılar yüklenemedi.' });
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUser, authLoading, toast, updateFriendshipStatus]);


    useEffect(() => {
        const filtered = allUsers.filter(user =>
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, allUsers]);

    const handleSendRequest = useCallback(async (friend: User) => {
        if (!currentUser) return;
        setActionLoading(friend.uid);
        try {
            const fromUser = {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                email: currentUser.email || '',
                photoURL: currentUser.photoURL,
            };
            await sendFriendRequest(fromUser, friend);
            toast({ title: 'Başarılı', description: 'Arkadaşlık isteği gönderildi.' });
            setFriendshipStatuses(prev => ({...prev, [friend.uid]: 'request_sent'}));
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: error.message || 'İstek gönderilemedi.',
            });
        } finally {
            setActionLoading(null);
        }
    }, [currentUser, toast]);

    const renderButton = (user: User) => {
        const status = friendshipStatuses[user.uid] || 'loading';
        const isLoading = status === 'loading' || actionLoading === user.uid;

        if (isLoading) {
            return (
                <Button size="sm" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor
                </Button>
            );
        }

        if (status === 'friends') {
            return <Button size="sm" disabled variant="secondary"><UserCheck className="mr-2 h-4 w-4"/>Arkadaşlar</Button>;
        }

        if (status === 'request_sent') {
            return <Button size="sm" disabled variant="outline">İstek Gönderildi</Button>;
        }

        return (
            <Button size="sm" onClick={() => handleSendRequest(user)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Arkadaş Ekle
            </Button>
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Kullanıcıları Bul</h1>
                 <Button asChild variant="outline">
                    <Link href="/chat">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sohbete Dön
                    </Link>
                </Button>
            </div>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Kullanıcı adı veya e-posta ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="flex justify-center mt-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <div key={user.uid} className="flex items-center justify-between p-3 bg-card rounded-lg shadow-sm">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            {renderButton(user)}
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground mt-8">
                           Aramanızla eşleşen kullanıcı bulunamadı.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
