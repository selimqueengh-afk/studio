import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface UserInfo {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
}

export const createOrGetRoom = async (user1: UserInfo, user2: UserInfo): Promise<string> => {
    // Create a consistent and unique room ID by sorting UIDs
    const roomId = user1.uid > user2.uid
        ? `${user1.uid}_${user2.uid}`
        : `${user2.uid}_${user1.uid}`;
    
    const roomDocRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomDocRef);

    if (!roomDoc.exists()) {
        await setDoc(roomDocRef, {
            name: `DM between ${user1.displayName} and ${user2.displayName}`,
            createdAt: serverTimestamp(),
            isDirectMessage: true,
            participants: {
              [user1.uid]: true,
              [user2.uid]: true,
            },
            participantNames: {
                [user1.uid]: user1.displayName,
                [user2.uid]: user2.displayName
            },
            participantPhotos: {
                [user1.uid]: user1.photoURL || null,
                [user2.uid]: user2.photoURL || null
            }
        });
    }
    return roomId;
}
