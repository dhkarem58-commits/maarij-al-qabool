import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { StudyEditionData } from './types/edition';
import {
  EDITION_LIMITS,
  sanitizeEditionForFirestore,
} from './utils/editionOverrides';

const app = initializeApp(firebaseConfig);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  lastActiveEditionId?: string;
}

export async function loadUserProfile(
  uid: string
): Promise<UserProfileRecord | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: String(data.uid || uid),
      displayName: String(data.displayName || 'طالب علم'),
      lastActiveEditionId:
        typeof data.lastActiveEditionId === 'string'
          ? data.lastActiveEditionId
          : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertUserProfile(
  uid: string,
  displayName: string,
  lastActiveEditionId?: string
): Promise<void> {
  const path = `users/${uid}`;
  const cleanName =
    displayName.trim().slice(0, EDITION_LIMITS.displayNameMaxLength) || 'طالب علم';
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        displayName: cleanName,
        ...(lastActiveEditionId &&
        EDITION_LIMITS.uidPattern.test(lastActiveEditionId)
          ? { lastActiveEditionId: lastActiveEditionId.slice(0, 128) }
          : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        displayName: cleanName,
        ...(lastActiveEditionId &&
        EDITION_LIMITS.uidPattern.test(lastActiveEditionId)
          ? { lastActiveEditionId: lastActiveEditionId.slice(0, 128) }
          : {}),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function mapEditionDoc(id: string, data: Record<string, unknown>): StudyEditionData {
  const updatedAtRaw = data.updatedAt as { toMillis?: () => number } | undefined;
  return {
    uid: String(data.uid || id),
    displayName: String(data.displayName || 'محرر'),
    bio: typeof data.bio === 'string' ? data.bio : '',
    isPublic: Boolean(data.isPublic),
    revision: typeof data.revision === 'number' ? data.revision : 0,
    topicOverrides:
      (data.topicOverrides as StudyEditionData['topicOverrides']) || {},
    questionOverrides:
      (data.questionOverrides as StudyEditionData['questionOverrides']) || {},
    addedQuestions: Array.isArray(data.addedQuestions)
      ? (data.addedQuestions as StudyEditionData['addedQuestions'])
      : [],
    updatedAtMs:
      updatedAtRaw && typeof updatedAtRaw.toMillis === 'function'
        ? updatedAtRaw.toMillis()
        : Date.now(),
  };
}

export async function loadEditionByUid(
  uid: string
): Promise<StudyEditionData | null> {
  const path = `editions/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'editions', uid));
    if (!snap.exists()) return null;
    return mapEditionDoc(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveEditionToFirestore(
  uid: string,
  edition: StudyEditionData
): Promise<void> {
  const path = `editions/${uid}`;
  const clean = sanitizeEditionForFirestore(edition, uid);
  try {
    const ref = doc(db, 'editions', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingRev =
        typeof snap.data()?.revision === 'number' ? snap.data().revision : 0;
      await updateDoc(ref, {
        displayName: clean.displayName,
        bio: clean.bio,
        isPublic: clean.isPublic,
        revision: Math.max(existingRev, clean.revision),
        topicOverrides: clean.topicOverrides,
        questionOverrides: clean.questionOverrides,
        addedQuestions: clean.addedQuestions,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPublicEditionsList(): Promise<StudyEditionData[]> {
  const path = 'editions';
  try {
    const q = query(
      collection(db, 'editions'),
      where('isPublic', '==', true),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapEditionDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeMyEdition(
  uid: string,
  onData: (edition: StudyEditionData | null) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const path = `editions/${uid}`;
  return onSnapshot(
    doc(db, 'editions', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
      } else {
        onData(mapEditionDoc(snap.id, snap.data() as Record<string, unknown>));
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}
