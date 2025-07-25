
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
import { createOrGetRoom } from '@/lib/rooms';
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
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const usersCol = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCol, (snapshot) => {
            const allUsers = snapshot.docs
              .map(doc => doc.data() as User)
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

    const startChat = async (friend: User) => {
        if (!currentUser) return;
        const roomId = await createOrGetRoom(currentUser, friend);
        router.push(`/chat/${roomId}`);
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
                            <Button asChild size="sm">
                                <Link href={`/profile/${user.uid}`}>
                                    Profili Görüntüle
                                </Link>
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
