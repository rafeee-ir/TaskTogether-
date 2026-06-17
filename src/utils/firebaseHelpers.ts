import { db, auth } from '../firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

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
  }
}

/**
 * Standardized Firestore error wrapper that complies with the Firebase Integration Skill instructions.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  
  const serialized = JSON.stringify(errInfo);
  console.error('Core Firestore Error Caught:', serialized);
  throw new Error(serialized);
}

/**
 * Validates the Firestore connection by executing a fast getFromServer operation.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test_connection_ping_probe', 'health'));
    return true;
  } catch (error: any) {
    if (error && (error.code === 'unavailable' || error.message?.includes('offline'))) {
      console.warn("Firestore reports client is currently offline.");
      return false;
    }
    // permission-denied is actually a success in terms of connectivity (we reached the cloud server!)
    if (error instanceof Error && error.message.includes('permission-denied')) {
      return true;
    }
    return false;
  }
}
