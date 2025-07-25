
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UserPlus, UserCheck, UserX, UserMinus } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '@/lib/friends';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

type FriendshipStatus = 'not_friends' | 'friends' | 'request_sent' | 'request_received';

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(null);

  const { toast } = useToast();

   useEffect(() => {
    if (!authLoading && currentUser?.uid === userId) {
      router.push('/chat');
    }
  }, [currentUser, userId, authLoading, router]);


  // Fetch profile data
  useEffect(() => {
    if (!userId) return;
    setLoadingProfile(true);
    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoadingProfile(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setProfile(null);
      setLoadingProfile(false);
    });
    return () => unsubscribe();
  }, [userId]);
  

  // Check friendship status
  useEffect(() => {
    if (!currentUser || !profile) return;

    const unsubscribers: (() => void)[] = [];

    // 1. Check if they are already friends
    const friendRef = doc(db, `users/${currentUser.uid}/friends/${profile.uid}`);
    const unsubscribeFriend = onSnapshot(friendRef, (docSnap) => {
      if (docSnap.exists()) {
        setFriendshipStatus('friends');
        return;
      }
      // If not friends, continue to check requests
      
      // 2. Check for a sent request
      const sentRequestRef = doc(db, 'friendRequests', `${currentUser.uid}_${profile.uid}`);
      const unsubscribeSent = onSnapshot(sentRequestRef, (sentSnap) => {
        if (sentSnap.exists()) {
          setFriendshipStatus('request_sent');
          return;
        }

        // 3. Check for a received request
        const receivedRequestRef = doc(db, 'friendRequests', `${profile.uid}_${currentUser.uid}`);
        const unsubscribeReceived = onSnapshot(receivedRequestRef, (receivedSnap) => {
          if (receivedSnap.exists()) {
            setFriendshipStatus('request_received');
            setIncomingRequestId(receivedSnap.id);
            return;
          }

          // 4. If none of the above, they are not friends
          setFriendshipStatus('not_friends');
        });
        unsubscribers.push(unsubscribeReceived);
      });
      unsubscribers.push(unsubscribeSent);
    });
    unsubscribers.push(unsubscribeFriend);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser, profile]);


  const handleSendRequest = async () => {
    if (!currentUser || !profile) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(currentUser, profile);
      toast({ title: 'Başarılı', description: 'Arkadaşlık isteği gönderildi.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message || 'İstek gönderilemedi.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentUser || !profile || !incomingRequestId) return;
    setActionLoading(true);
    try {
       await acceptFriendRequest(incomingRequestId, profile, currentUser);
       toast({ title: 'Başarılı', description: `${profile.displayName} artık arkadaşın.` });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Hata', description: 'İstek kabul edilemedi.' });
    } finally {
        setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
     if (!incomingRequestId) return;
     setActionLoading(true);
     try {
       await rejectFriendRequest(incomingRequestId);
       toast({ title: 'Reddedildi', description: 'Arkadaşlık isteği reddedildi.' });
     } catch (error: any) {
       toast({ variant: 'destructive', title: 'Hata', description: 'İstek reddedilemedi.' });
     } finally {
       setActionLoading(false);
     }
  };
  
  const handleRemoveFriend = async () => {
      if (!currentUser || !profile) return;
      setActionLoading(true);
      try {
          await removeFriend(currentUser.uid, profile.uid);
          toast({ title: 'Arkadaş Silindi', description: `${profile.displayName} artık arkadaşın değil.` });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Hata', description: 'Arkadaş silinemedi.' });
      } finally {
          setActionLoading(false);
      }
  }


  if (loadingProfile || authLoading || !friendshipStatus || currentUser?.uid === userId) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center p-4">Kullanıcı bulunamadı.</div>;
  }
  
  const renderFriendshipButton = () => {
    const buttonProps = {
        disabled: actionLoading,
        className: "flex items-center gap-2"
    };

    switch (friendshipStatus) {
      case 'friends':
        return (
            <Button variant="destructive" onClick={handleRemoveFriend} {...buttonProps}>
                {actionLoading ? <Loader2 className="animate-spin" /> : <UserMinus />} 
                <span>Arkadaştan Çıkar</span>
            </Button>
        );
      case 'request_sent':
        return <Button variant="secondary" disabled>İstek Gönderildi</Button>;
      case 'request_received':
        return (
          <div className="flex gap-2">
            <Button onClick={handleAcceptRequest} {...buttonProps}>
              {actionLoading ? <Loader2 className="animate-spin" /> : <UserCheck />} 
              <span>Kabul Et</span>
            </Button>
            <Button variant="outline" onClick={handleRejectRequest} {...buttonProps}>
              {actionLoading ? <Loader2 className="animate-spin" /> : <UserX />} 
              <span>Reddet</span>
            </Button>
          </div>
        );
      case 'not_friends':
        return (
            <Button onClick={handleSendRequest} {...buttonProps}>
                {actionLoading ? <Loader2 className="animate-spin" /> : <UserPlus />} 
                <span>Arkadaş Ekle</span>
            </Button>
        );
      default:
        return null;
    }
  };


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
            <div className="mt-6 h-10 flex items-center justify-center">
                {renderFriendshipButton()}
            </div>
        </div>
      </div>
    </div>
  );
}
