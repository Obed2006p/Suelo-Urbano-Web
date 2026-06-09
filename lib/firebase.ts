import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Detect whether the user has replaced the default placeholder config
export const isFirebaseActive = 
  firebaseConfig && 
  firebaseConfig.apiKey !== 'PLACEHOLDER_KEY' && 
  firebaseConfig.projectId !== 'suelo-urbano-web';

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseActive) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
    
    // Validate connection offline checks
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'muro_posts', 'test-connection'));
        console.log("Firebase connection established successfully!");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration: Client appears to be offline.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize active Firebase instance:", err);
  }
}

export { db, auth };

// Structured Diagnostic Error Handler wrapper according to System Guidelines
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Diagnostics:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
