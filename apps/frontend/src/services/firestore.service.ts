import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    type QueryConstraint,
    type DocumentData,
    type WhereFilterOp,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";

/**
 * Generic Firestore service with reusable CRUD utilities
 */

/**
 * Add a new document to a collection
 */
export async function addDocument<T = DocumentData>(
    collectionName: string,
    data: T,
): Promise<string> {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

/**
 * Set a document with a specific ID (creates or overwrites)
 */
export async function setDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    merge = false,
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await setDoc(
        docRef,
        {
            ...data,
            updatedAt: Timestamp.now(),
        },
        { merge },
    );
}

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
}

/**
 * Update a document
 */
export async function updateDocument<T = Partial<DocumentData>>(
    collectionName: string,
    docId: string,
    data: T,
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Delete a document
 */
export async function deleteDocument(
    collectionName: string,
    docId: string,
): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
}

/**
 * Query documents with filters
 */
export async function queryDocuments<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
): Promise<T[]> {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as T,
    );
}

/**
 * Paginated query helper
 */
export async function paginatedQuery<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    pageSize = 20,
    lastDoc?: DocumentData,
): Promise<{ data: T[]; hasMore: boolean; lastDoc?: DocumentData }> {
    const collectionRef = collection(db, collectionName);

    const queryConstraints = [...constraints, limit(pageSize + 1)];
    if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
    }

    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const data = docs
        .slice(0, pageSize)
        .map((doc) => ({ id: doc.id, ...doc.data() }) as T);

    return {
        data,
        hasMore,
        lastDoc: hasMore ? docs[pageSize - 1] : undefined,
    };
}

/**
 * Build query constraint helpers
 */
export function whereClause(
    field: string,
    operator: WhereFilterOp,
    value: unknown,
): QueryConstraint {
    return where(field, operator, value);
}

export function orderByClause(
    field: string,
    direction: "asc" | "desc" = "asc",
): QueryConstraint {
    return orderBy(field, direction);
}

export function limitClause(count: number): QueryConstraint {
    return limit(count);
}

/**
 * Convert Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp | undefined): Date | null {
    return timestamp ? timestamp.toDate() : null;
}

/**
 * Convert Date to Firestore Timestamp
 */
export function dateToTimestamp(date: Date | string): Timestamp {
    if (typeof date === "string") {
        return Timestamp.fromDate(new Date(date));
    }
    return Timestamp.fromDate(date);
}
