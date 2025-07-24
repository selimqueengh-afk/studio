
import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  collection,
} from 'firebase/firestore';

// Function to send a friend request using Firestore
export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  if (fromUid === toUid) return;
  const requestId = `${fromUid}_${toUid}`;
  const inverseRequestId = `${toUid}_${fromUid}`;
  
  const requestRef = doc(db, 'friendRequests', requestId);
  const inverseRequestRef = doc(db, 'friendRequests', inverseRequestId);

  const inverseRequestSnap = await getDoc(inverseRequestRef);
  // If an inverse request exists, it means the other user already sent us a request.
  // We can just accept it.
  if (inverseRequestSnap.exists()) {
    await acceptFriendRequest(toUid, fromUid);
    return;
  }
  
  const requestSnap = await getDoc(requestRef);
  if (requestSnap.exists()) {
    throw new Error('Arkadaşlık isteği zaten gönderilmiş.');
  }

  await setDoc(requestRef, {
    from: fromUid,
    to: toUid,
    createdAt: serverTimestamp(),
  });
};

// Function to accept a friend request using Firestore and a batch write
export const acceptFriendRequest = async (fromUid: string, toUid: string) => {
  const requestId = `${fromUid}_${toUid}`;
  const requestDocRef = doc(db, 'friendRequests', requestId);

  const requestSnap = await getDoc(requestDocRef);
  if (!requestSnap.exists()) {
    throw new Error('Arkadaşlık isteği bulunamadı veya zaten işlendi.');
  }

  const fromUserDocRef = doc(db, 'users', fromUid);
  const toUserDocRef = doc(db, 'users', toUid);

  const fromUserSnap = await getDoc(fromUserDocRef);
  const toUserSnap = await getDoc(toUserDocRef);

  if (!fromUserSnap.exists() || !toUserSnap.exists()) {
    throw new Error('Kullanıcı bulunamadı.');
  }
  
  const batch = writeBatch(db);

  // Add each user to the other's friends subcollection
  const toUserFriendRef = doc(collection(toUserDocRef, 'friends'), fromUid);
  batch.set(toUserFriendRef, fromUserSnap.data());

  const fromUserFriendRef = doc(collection(fromUserDocRef, 'friends'), toUid);
  batch.set(fromUserFriendRef, toUserSnap.data());

  // Delete the friend request
  batch.delete(requestDocRef);

  await batch.commit();
};

// Function to reject a friend request using Firestore
export const rejectFriendRequest = async (fromUid:string, toUid:string) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestDocRef = doc(db, `friendRequests`, requestId);
    await deleteDoc(requestDocRef);
};

// Function to remove a friend using Firestore
export const removeFriend = async (currentUserUid:string, friendUid:string) => {
    const batch = writeBatch(db);

    const userFriendRef = doc(db, `users/${currentUserUid}/friends/${friendUid}`);
    const friendUserRef = doc(db, `users/${friendUid}/friends/${currentUserUid}`);

    batch.delete(userFriendRef);
    batch.delete(friendUserRef);
    
    await batch.commit();
};

