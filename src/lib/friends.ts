
import { db } from './firebase';
import { doc, setDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Function to send a friend request
export const sendFriendRequest = async (fromUid: string, toUid:string) => {
  if (fromUid === toUid) return;
  const requestId = `${fromUid}_${toUid}`;
  await setDoc(doc(db, 'friendRequests', requestId), {
    from: fromUid,
    to: toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// Function to accept a friend request
export const acceptFriendRequest = async (fromUid: string, toUid: string) => {
  const batch = writeBatch(db);

  // Add each user to the other's friends subcollection
  const user1FriendRef = doc(db, 'users', fromUid, 'friends', toUid);
  batch.set(user1FriendRef, { since: serverTimestamp() });

  const user2FriendRef = doc(db, 'users', toUid, 'friends', fromUid);
  batch.set(user2FriendRef, { since: serverTimestamp() });

  // Delete the friend request - this was the source of the bug
  const requestId = `${fromUid}_${toUid}`;
  const requestDocRef = doc(db, 'friendRequests', requestId);
  batch.delete(requestDocRef);

  await batch.commit();
};

// Function to reject a friend request
export const rejectFriendRequest = async (fromUid: string, toUid: string) => {
  const requestId = `${fromUid}_${toUid}`;
  await deleteDoc(doc(db, 'friendRequests', requestId));
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
