
'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
  collection,
} from 'firebase/firestore';

interface UserInfo {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL?: string | null;
}

export const sendFriendRequest = async (fromUser: UserInfo, toUser: UserInfo) => {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const reverseRequestId = `${toUser.uid}_${fromUser.uid}`;

  const requestDocRef = doc(db, 'friendRequests', requestId);
  const reverseRequestDocRef = doc(db, 'friendRequests', reverseRequestId);
  const friendDocRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);

  const [requestSnap, reverseRequestSnap, friendSnap] = await Promise.all([
    getDoc(requestDocRef),
    getDoc(reverseRequestDocRef),
    getDoc(friendDocRef),
  ]);

  if (friendSnap.exists()) {
    throw new Error('Bu kullanıcı zaten arkadaşınız.');
  }
  if (requestSnap.exists()) {
    throw new Error('Arkadaşlık isteği zaten gönderilmiş.');
  }
  if (reverseRequestSnap.exists()) {
    throw new Error(
      'Bu kullanıcı size zaten bir istek göndermiş. Lütfen isteklerinizi kontrol edin.'
    );
  }

  const fromData = {
    uid: fromUser.uid,
    displayName: fromUser.displayName || null,
    email: fromUser.email,
    photoURL: fromUser.photoURL || null,
  };

  const toData = {
    uid: toUser.uid,
    displayName: toUser.displayName || null,
    email: toUser.email,
    photoURL: toUser.photoURL || null,
  };

  await setDoc(requestDocRef, {
    from: fromData,
    to: toData,
    createdAt: serverTimestamp(),
  });
};

export const acceptFriendRequest = async (
  requestId: string,
  fromUser: UserInfo,
  toUser: UserInfo
) => {
  const batch = writeBatch(db);

  const friendDataForCurrentUser = {
    uid: fromUser.uid,
    displayName: fromUser.displayName || null,
    email: fromUser.email,
    photoURL: fromUser.photoURL || null,
  };

  const currentUserDataForFriend = {
    uid: toUser.uid,
    displayName: toUser.displayName || null,
    email: toUser.email,
    photoURL: toUser.photoURL || null,
  };

  const toFriendRef = doc(db, `users/${toUser.uid}/friends/${fromUser.uid}`);
  batch.set(toFriendRef, friendDataForCurrentUser);

  const fromFriendRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
  batch.set(fromFriendRef, currentUserDataForFriend);

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
};
