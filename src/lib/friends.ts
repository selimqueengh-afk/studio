
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';

interface UserInfo {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export const sendFriendRequest = async (fromUser: UserInfo, toUser: UserInfo) => {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const requestDocRef = doc(db, 'friendRequests', requestId);
  const docSnap = await getDoc(requestDocRef);

  if (docSnap.exists()) {
    throw new Error('Friend request already sent.');
  }

  await setDoc(requestDocRef, {
    from: fromUser.uid,
    fromName: fromUser.displayName,
    fromPhoto: fromUser.photoURL || null,
    to: toUser.uid,
    toName: toUser.displayName,
    toPhoto: toUser.photoURL || null,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const acceptFriendRequest = async (requestId: string, fromUser: UserInfo, toUser: UserInfo) => {
  const batch = writeBatch(db);

  // Add to each other's friends list
  const fromFriendRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
  batch.set(fromFriendRef, {
    uid: toUser.uid,
    displayName: toUser.displayName,
    email: toUser.email,
    photoURL: toUser.photoURL || null
  });

  const toFriendRef = doc(db, `users/${toUser.uid}/friends/${fromUser.uid}`);
  batch.set(toFriendRef, {
    uid: fromUser.uid,
    displayName: fromUser.displayName,
    email: fromUser.email,
    photoURL: fromUser.photoURL || null
  });

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
}
