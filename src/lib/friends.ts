
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

  // Ensure data is not undefined before setting
  const fromData = {
    uid: fromUser.uid,
    displayName: fromUser.displayName || null,
    photoURL: fromUser.photoURL || null,
  };

  const toData = {
    uid: toUser.uid,
    displayName: toUser.displayName || null,
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
    photoURL: fromUser.photoURL || null,
  };

  const currentUserDataForFriend = {
    uid: toUser.uid,
    displayName: toUser.displayName || null,
    photoURL: toUser.photoURL || null,
  };

  // Add friend to current user's friend list
  const toFriendRef = doc(db, `users/${toUser.uid}/friends/${fromUser.uid}`);
  batch.set(toFriendRef, friendDataForCurrentUser);

  // Add current user to friend's friend list
  const fromFriendRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
  batch.set(fromFriendRef, currentUserDataForFriend);

  // Delete the friend request
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
