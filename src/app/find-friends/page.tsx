
"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot as onFirestoreSnapshot, where, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    const [friendUids, setFriendUids] = useState<string[]>([]);
    const [requestUids, setRequestUids] = useState<string[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch current user's friends and requests from RTDB to filter the user list
        const friendsRef = ref(rtdb, `friends/${currentUser.uid}`);
        onValue(friendsRef, (snapshot) => {
            setFriendUids(snapshot.exists() ? Object.keys(snapshot.val()) : []);
        });

        const requestsRef = ref(rtdb, 'friendRequests');
        onValue(requestsRef, (snapshot) => {
            const requests = snapshot.val() || {};
            const uids: string[] = [];
            for (const key in requests) {
                const request = requests[key];
                if (request.from === currentUser.uid) {
                    uids.push(request.to);
                }
                if (request.to === currentUser.uid) {
                    uids.push(request.from);
                }
            }
            setRequestUids(uids);
        });

        // Fetch all users from Firestore, excluding the current user
        const usersQuery = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
        const unsubscribe = onFirestoreSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => doc.data() as User);
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const filteredUsers = users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !friendUids.includes(user.uid) &&
        !requestUids.includes(user.uid)
    );

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

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
                            Aramanızla eşleşen kullanıcı bulunamadı veya tüm kullanıcılar zaten arkadaşınız.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
