
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
import { createOrGetRoom } from './rooms';

interface UserInfo {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL?: string | null;
}

export const sendFriendRequest = async (fromUser: UserInfo, toUser: UserInfo) => {
  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const requestDocRef = doc(db, 'friendRequests', requestId);

  // Check if a request from toUser to fromUser already exists
  const reverseRequestDocRef = doc(db, 'friendRequests', `${toUser.uid}_${fromUser.uid}`);
  const reverseRequestSnap = await getDoc(reverseRequestDocRef);
  if (reverseRequestSnap.exists()) {
      // If it exists, they are trying to accept a friend request.
      // We can automatically accept it.
      await acceptFriendRequest(reverseRequestSnap.id, toUser, fromUser);
      return;
  }
  
  // Check if they are already friends
    const friendDocRef = doc(db, `users/${fromUser.uid}/friends/${toUser.uid}`);
    const friendSnap = await getDoc(friendDocRef);
    if (friendSnap.exists()) {
        throw new Error("Zaten arkadaşsınız.");
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
  
  // Proactively create the chat room AFTER the batch has been committed.
  await createOrGetRoom(toUser, fromUser);
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
