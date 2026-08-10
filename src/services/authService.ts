import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserAccount, UserRole } from '../types';

const USERS_COLLECTION = 'users';

export async function getUserAccount(uid: string): Promise<UserAccount | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user account:', err);
    return null;
  }
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  beautyName: string = "Juliet's Makeup Desk"
): Promise<UserAccount> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  await updateProfile(user, { displayName });

  const newAccount: UserAccount = {
    uid: user.uid,
    email: user.email || email,
    displayName: displayName || 'Beauty',
    beautyName: beautyName || "Juliet's Makeup Desk",
    avatarUrl: '',
    bio: 'Lip gloss lover & dewy skin addict ♡',
    role: 'customer',
    skinType: 'Combination Glow',
    favoriteShade: 'Nairobi Red',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, USERS_COLLECTION, user.uid), newAccount);
  return newAccount;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserAccount> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const uid = credential.user.uid;

  let account = await getUserAccount(uid);
  if (!account) {
    // Fallback if missing
    account = {
      uid,
      email: credential.user.email || email,
      displayName: credential.user.displayName || 'Beauty',
      beautyName: "Juliet's Makeup Desk",
      role: 'customer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), account);
  }
  return account;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserProfileData(
  uid: string,
  updates: Partial<UserAccount>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export function subscribeToAuth(
  callback: (user: UserAccount | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      let account = await getUserAccount(firebaseUser.uid);
      if (!account) {
        account = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Beauty',
          beautyName: "Juliet's Makeup Desk",
          role: 'customer',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), account);
      }
      callback(account);
    } catch (e) {
      console.error('Error during auth subscription:', e);
      callback(null);
    }
  });
}
