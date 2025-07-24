
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

interface Friend {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export const createOrGetRoom = async (currentUser: User, selectedFriend: Friend): Promise<string> => {
    const currentUserUid = currentUser.uid;
    const selectedUserUid = selectedFriend.uid;

    // Create a consistent and unique room ID
    const roomId = currentUserUid > selectedUserUid
        ? `${currentUserUid}_${selectedUserUid}`
        : `${selectedUserUid}_${currentUserUid}`;
    
    const roomDocRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomDocRef);

    if (!roomDoc.exists()) {
        await setDoc(roomDocRef, {
            name: `DM with ${selectedFriend.displayName}`,
            createdAt: serverTimestamp(),
            isDirectMessage: true,
            participants: {
              [currentUserUid]: true,
              [selectedUserUid]: true,
            },
            participantNames: {
                [currentUserUid]: currentUser.displayName,
                [selectedUserUid]: selectedFriend.displayName
            },
            participantPhotos: {
                [currentUserUid]: currentUser.photoURL,
                [selectedUserUid]: selectedFriend.photoURL
            }
        });
    }
    return roomId;
}
