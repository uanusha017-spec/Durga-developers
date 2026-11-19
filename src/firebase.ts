import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ProjectCategory } from './data/siteData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAPPED_ADMIN_EMAIL = 'uanusha017@gmail.com';

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

export type EnquiryType = 'contact' | 'site_visit' | 'career';
export type EnquiryStatus = 'new' | 'contacted' | 'scheduled' | 'closed';
export type PropertyStatus = 'Ongoing' | 'Completed';
export type PropertyImageKey =
  | 'hero'
  | 'heroTwilightApartments'
  | 'heroPlottedAvenue'
  | 'heroCommercialPlaza'
  | 'apartments'
  | 'layouts'
  | 'commercial';

export interface StoredProperty {
  id: string;
  name: string;
  category: ProjectCategory;
  status: PropertyStatus;
  location: string;
  highlightMetric: string;
  secondaryMetric: string;
  summary: string;
  overview: string;
  address: string;
  specifications: string[];
  transitHighlights: string[];
  imageKey: PropertyImageKey;
  createdBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface StoredEnquiry {
  id: string;
  type: EnquiryType;
  name: string;
  phone: string;
  email: string;
  projectOrRole: string;
  category: string;
  preferredDate: string;
  message: string;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface StoredSubscriber {
  id: string;
  email: string;
  createdAt?: Timestamp | null;
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export interface NewEnquiryInput {
  type: EnquiryType;
  name: string;
  phone: string;
  email?: string;
  projectOrRole?: string;
  category?: string;
  preferredDate?: string;
  message?: string;
}

export async function submitEnquiry(input: NewEnquiryInput): Promise<string> {
  const id = makeDocId('enq');
  const path = `enquiries/${id}`;
  const payload = {
    type: input.type,
    name: clampString(input.name, 100),
    phone: clampString(input.phone, 25),
    email: clampString(input.email || '', 120),
    projectOrRole: clampString(input.projectOrRole || '', 140),
    category: clampString(input.category || '', 100),
    preferredDate: clampString(input.preferredDate || '', 40),
    message: clampString(input.message || '', 1500),
    status: 'new' as EnquiryStatus,
    adminNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'enquiries', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEnquiryAdmin(
  enquiryId: string,
  status: EnquiryStatus,
  adminNotes: string
): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), {
      status,
      adminNotes: clampString(adminNotes, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeEnquiry(enquiryId: string): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await deleteDoc(doc(db, 'enquiries', enquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitSubscriber(email: string): Promise<string> {
  const id = makeDocId('sub');
  const path = `subscribers/${id}`;
  try {
    await setDoc(doc(db, 'subscribers', id), {
      email: clampString(email.toLowerCase(), 120),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeSubscriber(subscriberId: string): Promise<void> {
  const path = `subscribers/${subscriberId}`;
  try {
    await deleteDoc(doc(db, 'subscribers', subscriberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface PropertyFormInput {
  name: string;
  category: ProjectCategory;
  status: PropertyStatus;
  location: string;
  highlightMetric: string;
  secondaryMetric: string;
  summary: string;
  overview: string;
  address: string;
  specifications: string[];
  transitHighlights: string[];
  imageKey: PropertyImageKey;
}

export async function createPropertyRecord(input: PropertyFormInput): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Admin sign-in is required to create a property.');
  }
  const id = makeDocId('prop');
  const path = `properties/${id}`;
  const cleanSpecs = input.specifications
    .map((s) => clampString(s, 160))
    .filter(Boolean)
    .slice(0, 12);
  const cleanTransit = input.transitHighlights
    .map((t) => clampString(t, 160))
    .filter(Boolean)
    .slice(0, 8);

  const payload = {
    name: clampString(input.name, 120),
    category: input.category,
    status: input.status,
    location: clampString(input.location, 140),
    highlightMetric: clampString(input.highlightMetric, 80),
    secondaryMetric: clampString(input.secondaryMetric, 80),
    summary: clampString(input.summary, 500),
    overview: clampString(input.overview, 1500),
    address: clampString(input.address, 240),
    specifications: cleanSpecs.length > 0 ? cleanSpecs : ['100% Vastu Compliant & Approved'],
    transitHighlights: cleanTransit,
    imageKey: input.imageKey,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'properties', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePropertyRecord(
  propertyId: string,
  input: PropertyFormInput
): Promise<void> {
  const path = `properties/${propertyId}`;
  const cleanSpecs = input.specifications
    .map((s) => clampString(s, 160))
    .filter(Boolean)
    .slice(0, 12);
  const cleanTransit = input.transitHighlights
    .map((t) => clampString(t, 160))
    .filter(Boolean)
    .slice(0, 8);

  try {
    await updateDoc(doc(db, 'properties', propertyId), {
      name: clampString(input.name, 120),
      category: input.category,
      status: input.status,
      location: clampString(input.location, 140),
      highlightMetric: clampString(input.highlightMetric, 80),
      secondaryMetric: clampString(input.secondaryMetric, 80),
      summary: clampString(input.summary, 500),
      overview: clampString(input.overview, 1500),
      address: clampString(input.address, 240),
      specifications: cleanSpecs.length > 0 ? cleanSpecs : ['100% Vastu Compliant & Approved'],
      transitHighlights: cleanTransit,
      imageKey: input.imageKey,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removePropertyRecord(propertyId: string): Promise<void> {
  const path = `properties/${propertyId}`;
  try {
    await deleteDoc(doc(db, 'properties', propertyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export { collection };
