
'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';

interface UserInfo {
    uid: string;
    displayName: string | null;
    email?: string | null;
    photoURL?: string | null;
}

export const sendFriendRequest = async (fromUser: UserInfo, toUser: UserInfo) => {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const reverseRequestId = `${toUser.uid}_${fromUser.uid}`;
  
  const requestDocRef = doc(db, 'friendRequests', requestId);
  const reverseRequestDocRef = doc(db, 'friendRequests', reverseRequestId);
  const friendDocRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
  const friendOfFriendDocRef = doc(db, `users/${toUser.uid}/friends/${fromUser.uid}`);

  const [requestSnap, reverseRequestSnap, friendSnap, friendOfFriendSnap] = await Promise.all([
    getDoc(requestDocRef),
    getDoc(reverseRequestDocRef),
    getDoc(friendDocRef),
    getDoc(friendOfFriendDocRef)
  ]);

  if (friendSnap.exists() || friendOfFriendSnap.exists()) {
    throw new Error('Bu kullanıcı zaten arkadaşınız.');
  }
  if (requestSnap.exists()) {
    throw new Error('Arkadaşlık isteği zaten gönderilmiş.');
  }
  if (reverseRequestSnap.exists()) {
    throw new Error('Bu kullanıcıdan zaten bir arkadaşlık isteğiniz var.');
  }

  await setDoc(requestDocRef, {
    from: fromUser.uid,
    fromName: fromUser.displayName || 'Bilinmeyen Kullanıcı',
    fromPhoto: fromUser.photoURL || null,
    to: toUser.uid,
    toName: toUser.displayName || 'Bilinmeyen Kullanıcı',
    toPhoto: toUser.photoURL || null,
    createdAt: serverTimestamp(),
  });
};

export const acceptFriendRequest = async (requestId: string, fromUser: UserInfo, toUser: UserInfo) => {
  const batch = writeBatch(db);

  const toFriendRef = doc(db, `users/${toUser.uid}/friends/${fromUser.uid}`);
  batch.set(toFriendRef, {
    uid: fromUser.uid,
    displayName: fromUser.displayName || 'Bilinmeyen Kullanıcı',
    photoURL: fromUser.photoURL || null,
  });

  const fromFriendRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
  batch.set(fromFriendRef, {
    uid: toUser.uid,
    displayName: toUser.displayName || 'Bilinmeyen Kullanıcı',
    photoURL: toUser.photoURL || null,
  });

  const requestDocRef = doc(db, 'friendRequests', requestId);
  batch.delete(requestDocRef);

  await batch.commit();
};

export const rejectFriendRequest = async (requestId: string) => {
  const requestDocRef = doc(db, 'friendRequests', requestId);
  await deleteDoc(requestDocRef);
};

export const removeFriend = async (currentUserUid: string, friendUid: string) => {
    const batch = writeBatch(db);

    const currentUserFriendRef = doc(db, `users/${currentUserUid}/friends/${friendUid}`);
    batch.delete(currentUserFriendRef);

    const friendUserFriendRef = doc(db, `users/${friendUid}/friends/${currentUserUid}`);
    batch.delete(friendUserFriendRef);

    await batch.commit();
}
