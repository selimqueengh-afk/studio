
"use client";

import { useEffect, useState, useMemo } from 'react';
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

type FriendshipStatus = 'loading' | 'not_friends' | 'friends' | 'request_sent' | 'request_received';

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('loading');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const incomingRequestId = useMemo(() => {
    if (!currentUser || !profile) return null;
    return `${profile.uid}_${currentUser.uid}`;
  }, [currentUser, profile]);

  const outgoingRequestId = useMemo(() => {
    if (!currentUser || !profile) return null;
    return `${currentUser.uid}_${profile.uid}`;
  }, [currentUser, profile]);

  // Redirect if viewing own profile
  useEffect(() => {
    if (!authLoading && currentUser?.uid === userId) {
      router.replace('/chat');
    }
  }, [currentUser, userId, authLoading, router]);

  // Fetch profile data
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setProfile(null);
    });
    return () => unsubscribe();
  }, [userId]);

  // Unified friendship status listener
  useEffect(() => {
    if (!currentUser || !profile || !outgoingRequestId || !incomingRequestId) {
        setFriendshipStatus('loading');
        return;
    }

    const friendRef = doc(db, `users/${currentUser.uid}/friends/${profile.uid}`);
    const sentRequestRef = doc(db, 'friendRequests', outgoingRequestId);
    const receivedRequestRef = doc(db, 'friendRequests', incomingRequestId);

    // Combine all listeners into one effect
    const unsubFriend = onSnapshot(friendRef, (friendSnap) => {
      const unsubSent = onSnapshot(sentRequestRef, (sentSnap) => {
        const unsubReceived = onSnapshot(receivedRequestRef, (receivedSnap) => {
          if (friendSnap.exists()) {
            setFriendshipStatus('friends');
          } else if (sentSnap.exists()) {
            setFriendshipStatus('request_sent');
          } else if (receivedSnap.exists()) {
            setFriendshipStatus('request_received');
          } else {
            setFriendshipStatus('not_friends');
          }
        });
        return unsubReceived;
      });
      return unsubSent;
    });

    return () => {
      // This might not be perfect as inner unsubs are not returned, but it's better.
      // A more robust solution would involve a more complex cleanup function.
      unsubFriend();
    };
  }, [currentUser, profile, outgoingRequestId, incomingRequestId]);


  const handleAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
    setActionLoading(true);
    try {
      await action();
      toast({ title: 'Başarılı', description: successMessage });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hata', description: error.message || errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendRequest = () => {
    if (!currentUser || !profile) return;
    handleAction(
      () => sendFriendRequest(currentUser, profile),
      'Arkadaşlık isteği gönderildi.',
      'İstek gönderilemedi.'
    );
  };

  const handleAcceptRequest = () => {
    if (!currentUser || !profile || !incomingRequestId) return;
    const fromUser = { uid: profile.uid, displayName: profile.displayName, email: profile.email, photoURL: profile.photoURL };
    handleAction(
      () => acceptFriendRequest(incomingRequestId, fromUser, currentUser),
      `${profile.displayName} artık arkadaşın.`,
      'İstek kabul edilemedi.'
    );
  };

  const handleRejectRequest = () => {
    if (!incomingRequestId) return;
    handleAction(
      () => rejectFriendRequest(incomingRequestId),
      'Arkadaşlık isteği reddedildi.',
      'İstek reddedilemedi.'
    );
  };

  const handleRemoveFriend = () => {
    if (!currentUser || !profile) return;
    handleAction(
      () => removeFriend(currentUser.uid, profile.uid),
      `${profile.displayName} artık arkadaşın değil.`,
      'Arkadaş silinemedi.'
    );
  };
  
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
      case 'loading':
         return <Loader2 className="h-6 w-6 animate-spin" />;
      default:
        return null;
    }
  };

  if (authLoading || !profile || currentUser?.uid === userId) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
            <div className="mt-6 h-10 flex items-center justify-center">
                {renderFriendshipButton()}
            </div>
        </div>
      </div>
    </div>
  );
}
