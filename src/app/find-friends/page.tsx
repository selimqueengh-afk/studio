
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';

interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function FindFriendsPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [friendAndRequestUids, setFriendAndRequestUids] = useState<Set<string>>(new Set());

    const fetchUsersAndRelations = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            // Fetch all users
            const usersCol = collection(db, 'users');
            const userSnapshot = await getDocs(usersCol);
            const allUsers = userSnapshot.docs.map(doc => doc.data() as User);
            setUsers(allUsers.filter(u => u.uid !== uid));

            // Fetch friends
            const friendsQuery = query(collection(db, `users/${uid}/friends`));
            const friendsSnapshot = await getDocs(friendsQuery);
            const friendIds = new Set(friendsSnapshot.docs.map(doc => doc.id));

            // Fetch sent and received friend requests
            const sentRequestsQuery = query(collection(db, 'friendRequests'), where('from', '==', uid));
            const receivedRequestsQuery = query(collection(db, 'friendRequests'), where('to', '==', uid));
            
            const [sentSnapshot, receivedSnapshot] = await Promise.all([
                getDocs(sentRequestsQuery),
                getDocs(receivedRequestsQuery)
            ]);
            
            const sentRequestUids = sentSnapshot.docs.map(doc => doc.data().to);
            const receivedRequestUids = receivedSnapshot.docs.map(doc => doc.data().from);
            
            setFriendAndRequestUids(new Set([...friendIds, ...sentRequestUids, ...receivedRequestUids]));

        } catch (error) {
            console.error("Error fetching initial data: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchUsersAndRelations(currentUser.uid);
        } else {
            setLoading(false);
        }
    }, [currentUser, fetchUsersAndRelations]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users.filter(user => !friendAndRequestUids.has(user.uid));
        }
        return users.filter(user =>
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !friendAndRequestUids.has(user.uid)
        );
    }, [users, searchTerm, friendAndRequestUids]);


    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Arkadaş Bul</h1>
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
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Profil
                                </Link>
                            </Button>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground mt-8">
                            Aramanızla eşleşen kullanıcı bulunamadı veya tüm kullanıcılar zaten arkadaşınız/istek gönderilmiş.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
