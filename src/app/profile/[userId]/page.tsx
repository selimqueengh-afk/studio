
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getInitials } from '@/lib/utils';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && currentUser?.uid === userId) {
      router.push('/chat');
    }
  }, [currentUser, userId, authLoading, router]);

  useEffect(() => {
    if (!userId || authLoading || currentUser?.uid === userId) return;

    setLoading(true);
    const docRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.log('No such user document!');
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
      setProfile(null);
    });
    
    return () => unsubscribeUser();
  }, [userId, currentUser, authLoading]);

  if (loading || authLoading || currentUser?.uid === userId) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="text-center p-4">Kullanıcı bulunamadı.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
      <div className="w-full max-w-sm relative">
         <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
         </Button>
        <div className="bg-card rounded-2xl shadow-lg p-8 pt-16 flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-6 ring-4 ring-primary/20">
                <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                <AvatarFallback className="text-4xl">{getInitials(profile.displayName)}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold text-foreground">{profile.displayName}</h1>
            <p className="text-muted-foreground mt-1">{profile.email}</p>
        </div>
      </div>
    </div>
  );
}
