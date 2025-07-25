
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Search, ArrowLeft } from 'lucide-react';
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

export default function FindFriendsPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const usersCol = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCol, (snapshot) => {
            const allUsers = snapshot.docs
              .map(doc => ({ ...doc.data(), uid: doc.id } as User))
              .filter(u => u.uid !== currentUser.uid);
            setUsers(allUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }
        return users.filter(user =>
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleSendRequest = async (friend: User) => {
        if (!currentUser) return;
        setActionLoading(friend.uid);
        try {
            await sendFriendRequest(currentUser, friend);
            toast({ title: 'Başarılı', description: 'Arkadaşlık isteği gönderildi.' });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: error.message || 'İstek gönderilemedi.',
            });
        } finally {
            setActionLoading(null);
        }
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
                    placeholder="Kullanıcı adı ara..."
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
                            <Button 
                                size="sm" 
                                onClick={() => handleSendRequest(user)}
                                disabled={actionLoading === user.uid}
                            >
                                {actionLoading === user.uid ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                Arkadaş Ekle
                            </Button>
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
