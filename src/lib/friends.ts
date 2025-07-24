
import { db } from './firebase';
import { doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';

// Function to send a friend request
export const sendFriendRequest = async (fromUid: string, toUid:string) => {
  if (fromUid === toUid) return;
  // Use a consistent ID format to prevent duplicates and simplify rule logic
  const friendRequestDocId = `${fromUid}_${toUid}`;
  const requestDocRef = doc(db, 'friendRequests', friendRequestDocId);

  // Check if an inverse request exists from the other user
  const inverseRequestDocRef = doc(db, 'friendRequests', `${toUid}_${fromUid}`);
  const inverseRequestSnap = await getDoc(inverseRequestDocRef);
  
  if (inverseRequestSnap.exists()) {
    // If an inverse request exists, it means the other person already sent you a request.
    // Instead of creating a new request, we should accept their existing request.
    // The user accepting is `fromUid`, the user who sent the request is `toUid`.
    await acceptFriendRequest(toUid, fromUid);
    return;
  }

  // Also check if a request from you already exists
  const requestSnap = await getDoc(requestDocRef);
  if(requestSnap.exists()) {
    // Request already sent
    return;
  }

  await setDoc(requestDocRef, {
    from: fromUid,
    to: toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// Function to accept a friend request
// fromUid: the user who SENT the request
// toUid: the user who is ACCEPTING the request (the current user)
export const acceptFriendRequest = async (fromUid: string, toUid: string) => {
  const batch = writeBatch(db);
  const requestId = `${fromUid}_${toUid}`;
  const requestDocRef = doc(db, 'friendRequests', requestId);

  // Check if the request document exists before proceeding
  const requestSnap = await getDoc(requestDocRef);
  if (!requestSnap.exists()) {
    throw new Error("Arkadaşlık isteği bulunamadı veya zaten işlendi.");
  }

  // Add each user to the other's friends subcollection
  // Add the sender (fromUid) to the acceptor's (toUid) friend list
  const acceptorFriendRef = doc(db, 'users', toUid, 'friends', fromUid);
  batch.set(acceptorFriendRef, { since: serverTimestamp() });

  // Add the acceptor (toUid) to the sender's (fromUid) friend list
  const senderFriendRef = doc(db, 'users', fromUid, 'friends', toUid);
  batch.set(senderFriendRef, { since: serverTimestamp() });

  // Delete the friend request document
  batch.delete(requestDocRef);

  await batch.commit();
};


// Function to reject a friend request
// fromUid: the user who SENT the request
// toUid: the user who is REJECTING the request (the current user)
export const rejectFriendRequest = async (fromUid: string, toUid: string) => {
    const requestId = `${fromUid}_${toUid}`;
    const requestDocRef = doc(db, 'friendRequests', requestId);
    await deleteDoc(requestDocRef);
};


// Function to remove a friend
export const removeFriend = async (currentUserUid: string, friendUid: string) => {
    const batch = writeBatch(db);

    // Remove friend from current user's friend list
    const userFriendRef = doc(db, 'users', currentUserUid, 'friends', friendUid);
    batch.delete(userFriendRef);

    // Remove current user from friend's friend list
    const friendUserRef = doc(db, 'users', friendUid, 'friends', currentUserUid);
    batch.delete(friendUserRef);
    
    await batch.commit();
}
