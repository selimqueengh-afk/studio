
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
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

    useEffect(() => {
        if (authLoading || !currentUser) {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Get all users
                const usersQuery = query(collection(db, 'users'));
                const usersSnapshot = await getDocs(usersQuery);
                const usersData = usersSnapshot.docs
                    .map(doc => ({ ...doc.data(), uid: doc.id } as User))
                    .filter(u => u.uid !== currentUser.uid);
                setAllUsers(usersData);

                // 2. Get current user's friends and sent requests
                const friendsQuery = query(collection(db, `users/${currentUser.uid}/friends`));
                const requestsQuery = query(collection(db, 'friendRequests'), where => where('from.uid', '==', currentUser.uid));
                
                const [friendsSnapshot, requestsSnapshot] = await Promise.all([
                    getDocs(friendsQuery),
                    getDocs(requestsQuery),
                ]);

                const friendUids = new Set(friendsSnapshot.docs.map(doc => doc.id));
                const sentRequestUids = new Set(requestsSnapshot.docs.map(doc => (doc.data().to as UserInfo).uid));

                // 3. Set initial statuses
                const statuses: Record<string, FriendshipStatus> = {};
                usersData.forEach(user => {
                    if (friendUids.has(user.uid)) {
                        statuses[user.uid] = 'friends';
                    } else if (sentRequestUids.has(user.uid)) {
                        statuses[user.uid] = 'request_sent';
                    } else {
                        statuses[user.uid] = 'not_friends';
                    }
                });
                setFriendshipStatuses(statuses);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: 'destructive', title: 'Hata', description: 'Kullanıcı verileri yüklenemedi.' });
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

    }, [currentUser, authLoading, toast]);


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
            await sendFriendRequest(currentUser, friend);
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
                                    <AvatarImage src={user.photoURL} alt={user.displayName} />
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

interface UserInfo {
  uid: string;
  displayName: string;
  photoURL?: string | null;
}
