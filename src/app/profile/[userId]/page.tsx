
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserCheck, Clock, UserX, ArrowLeft } from 'lucide-react';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '@/lib/friends';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
};

type FriendshipStatus = 'none' | 'pending' | 'friends' | 'received_request';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  };

  const checkFriendshipStatus = useCallback(async () => {
    if (!currentUser || !userId) return;

    // Check if they are friends
    const friendDoc = await getDoc(doc(db, 'users', currentUser.uid, 'friends', userId));
    if (friendDoc.exists()) {
      setFriendshipStatus('friends');
      return;
    }
    
    // Check if a request was sent
    const sentRequestDoc = await getDoc(doc(db, 'friendRequests', `${currentUser.uid}_${userId}`));
    if (sentRequestDoc.exists()) {
      setFriendshipStatus('pending');
      return;
    }

    // Check if a request was received
    const receivedRequestDoc = await getDoc(doc(db, 'friendRequests', `${userId}_${currentUser.uid}`));
    if (receivedRequestDoc.exists()) {
        setFriendshipStatus('received_request');
        return;
    }

    setFriendshipStatus('none');

  }, [currentUser, userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);
  
  useEffect(() => {
    if (!currentUser || !userId) return;

    // Listen for changes in friend requests to update status in real-time
    const sentReqUnsub = onSnapshot(doc(db, "friendRequests", `${currentUser.uid}_${userId}`), () => {
        checkFriendshipStatus();
    });
    const receivedReqUnsub = onSnapshot(doc(db, "friendRequests", `${userId}_${currentUser.uid}`), () => {
        checkFriendshipStatus();
    });
    // Listen for changes in friends subcollections
    const userFriendsUnsub = onSnapshot(collection(db, `users/${currentUser.uid}/friends`), () => {
        checkFriendshipStatus();
    });

    checkFriendshipStatus();

    return () => {
        sentReqUnsub();
        receivedReqUnsub();
        userFriendsUnsub();
    };
  }, [currentUser, userId, checkFriendshipStatus]);


  const handleSendRequest = async () => {
    if (!currentUser || !profile) return;
    setIsUpdating(true);
    try {
      await sendFriendRequest(currentUser.uid, profile.uid);
      setFriendshipStatus('pending');
      toast({ title: 'Başarılı', description: 'Arkadaşlık isteği gönderildi.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata', description: (error as Error).message || 'İstek gönderilemedi.' });
    }
    setIsUpdating(false);
  };

  const handleAcceptRequest = async () => {
    if (!currentUser || !profile) return;
     setIsUpdating(true);
    try {
      await acceptFriendRequest(profile.uid, currentUser.uid);
      setFriendshipStatus('friends');
       toast({ title: 'Başarılı', description: 'Arkadaşlık isteği kabul edildi.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata', description: (error as Error).message || 'İstek kabul edilemedi.' });
    }
     setIsUpdating(false);
  };
  
  const handleRejectRequest = async () => {
    if (!currentUser || !profile) return;
     setIsUpdating(true);
    try {
      await rejectFriendRequest(profile.uid, currentUser.uid);
      setFriendshipStatus('none');
       toast({ title: 'Başarılı', description: 'Arkadaşlık isteği reddedildi.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata', description: (error as Error).message || 'İstek reddedilemedi.' });
    }
    setIsUpdating(false);
  }

  const handleRemoveFriend = async () => {
     if (!currentUser || !profile || !window.confirm(`${profile.displayName} kişisini arkadaşlıktan çıkarmak istediğinizden emin misiniz?`)) return;
     setIsUpdating(true);
    try {
      await removeFriend(currentUser.uid, profile.uid);
      setFriendshipStatus('none');
      toast({ title: 'Başarılı', description: 'Arkadaşlıktan çıkarıldı.' });
    } catch (error) {
      console.error(error);
       toast({ variant: 'destructive', title: 'Hata', description: (error as Error).message || 'Arkadaşlıktan çıkarılamadı.' });
    }
    setIsUpdating(false);
  }

  const renderFriendshipButton = () => {
    if (isUpdating) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor...</Button>;
    }

    switch (friendshipStatus) {
      case 'friends':
        return <Button variant="destructive" onClick={handleRemoveFriend}><UserX className="mr-2 h-4 w-4" /> Arkadaşlıktan Çıkar</Button>;
      case 'pending':
        return <Button variant="secondary" disabled><Clock className="mr-2 h-4 w-4" /> İstek Gönderildi</Button>;
      case 'received_request':
        return (
          <div className="flex gap-2">
            <Button onClick={handleAcceptRequest}><UserCheck className="mr-2 h-4 w-4" /> Kabul Et</Button>
            <Button variant="secondary" onClick={handleRejectRequest}>Reddet</Button>
          </div>
        );
      case 'none':
      default:
        return <Button onClick={handleSendRequest}><UserPlus className="mr-2 h-4 w-4" /> Arkadaş Ekle</Button>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="text-center">Kullanıcı bulunamadı.</div>;
  }
  
  if (currentUser?.uid === userId) {
    return <div className="text-center p-8">Burası sizin profil sayfanız.</div>
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
            <div className="mt-8">
                {renderFriendshipButton()}
            </div>
        </div>
      </div>
    </div>
  );
}
