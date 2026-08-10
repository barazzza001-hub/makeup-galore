import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedLook } from '../types';

const SAVED_LOOKS_COLLECTION = 'savedLooks';

export async function fetchUserSavedLooksFromFirestore(userId: string): Promise<SavedLook[]> {
  try {
    const q = query(
      collection(db, SAVED_LOOKS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const looks: SavedLook[] = [];
    snap.forEach((d) => looks.push(d.data() as SavedLook));
    return looks.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching user saved looks:', err);
    return [];
  }
}

export async function saveLookToFirestore(
  userId: string,
  lookData: Omit<SavedLook, 'id' | 'createdAt'>
): Promise<SavedLook> {
  const id = 'look_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const fullLook: SavedLook = {
    ...lookData,
    id,
    userId,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, SAVED_LOOKS_COLLECTION, id), fullLook);
  return fullLook;
}

export async function deleteLookFromFirestore(lookId: string): Promise<void> {
  await deleteDoc(doc(db, SAVED_LOOKS_COLLECTION, lookId));
}

export async function syncLocalLooksToFirestore(
  userId: string,
  localLooks: SavedLook[]
): Promise<SavedLook[]> {
  if (!localLooks || localLooks.length === 0) {
    return fetchUserSavedLooksFromFirestore(userId);
  }

  const existing = await fetchUserSavedLooksFromFirestore(userId);
  const existingIds = new Set(existing.map((l) => l.id));

  for (const localLook of localLooks) {
    if (!existingIds.has(localLook.id)) {
      await saveLookToFirestore(userId, {
        ...localLook,
        userId,
      });
    }
  }

  return fetchUserSavedLooksFromFirestore(userId);
}
