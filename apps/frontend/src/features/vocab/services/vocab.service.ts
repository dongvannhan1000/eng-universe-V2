import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";

/**
 * Vocabulary Firebase Service
 * Replaces the HTTP-based vocab service with Firestore
 */

export interface Vocab {
    id: string;
    userId: string;
    word: string;
    meaningVi: string;
    explanationEn?: string;
    notes?: string;
    tags: string[];
    addedAt: Date;
    lastReviewedAt?: Date;
    isSuspended: boolean;
    dueAt: Date;
    intervalDays: number;
    ease: number;
    repetitions: number;
    lapses: number;
    lastResult?: "AGAIN" | "HARD" | "GOOD" | "EASY";
}

export interface CreateVocabInput {
    word: string;
    meaningVi: string;
    explanationEn?: string;
    notes?: string;
    tags?: string[];
}

export interface ListVocabParams {
    q?: string;
    tags?: string[];
    from?: string | null;
    to?: string | null;
    page?: number;
    limit?: number;
    includeSuspended?: boolean;
}

export interface PaginatedVocab {
    data: Vocab[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * List vocabs with filters and pagination
 */
export async function listVocabs(
    userId: string,
    params: ListVocabParams = {},
): Promise<PaginatedVocab> {
    const {
        q,
        tags,
        from,
        to,
        page = 1,
        limit = 20,
        includeSuspended = false,
    } = params;

    const vocabsRef = collection(db, "users", userId, "vocabs");
    const constraints: QueryConstraint[] = [];

    // Filter by suspended status
    if (!includeSuspended) {
        constraints.push(where("isSuspended", "==", false));
    }

    // Filter by tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
        constraints.push(where("tags", "array-contains-any", tags.slice(0, 10)));
    }

    // Filter by date range
    if (from) {
        constraints.push(where("addedAt", ">=", Timestamp.fromDate(new Date(from))));
    }
    if (to) {
        constraints.push(where("addedAt", "<=", Timestamp.fromDate(new Date(to))));
    }

    // Order by addedAt descending
    constraints.push(orderBy("addedAt", "desc"));

    // Build query
    const q1 = query(vocabsRef, ...constraints);
    const snapshot = await getDocs(q1);

    // Get all docs and manually filter by search query
    let allVocabs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate(),
        lastReviewedAt: doc.data().lastReviewedAt?.toDate(),
        dueAt: doc.data().dueAt?.toDate(),
    })) as Vocab[];

    // Client-side text search
    if (q) {
        const searchLower = q.toLowerCase();
        allVocabs = allVocabs.filter(
            (v) =>
                v.word.toLowerCase().includes(searchLower) ||
                v.meaningVi.toLowerCase().includes(searchLower) ||
                v.explanationEn?.toLowerCase().includes(searchLower),
        );
    }

    // Pagination
    const total = allVocabs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = allVocabs.slice(startIndex, startIndex + limit);

    return {
        data,
        total,
        page,
        limit,
        totalPages,
    };
}

/**
 * Create a new vocab
 */
export async function createVocab(
    userId: string,
    data: CreateVocabInput,
): Promise<Vocab> {
    const vocabsRef = collection(db, "users", userId, "vocabs");

    const now = Timestamp.now();
    const vocabData = {
        userId,
        word: data.word,
        meaningVi: data.meaningVi,
        explanationEn: data.explanationEn || "",
        notes: data.notes || "",
        tags: data.tags || [],
        addedAt: now,
        isSuspended: false,
        dueAt: now, // Due immediately for first review
        intervalDays: 0,
        ease: 250, // 2.5 * 100
        repetitions: 0,
        lapses: 0,
    };

    const docRef = await addDoc(vocabsRef, vocabData);
    const docSnap = await getDoc(docRef);

    return {
        id: docRef.id,
        ...docSnap.data(),
        addedAt: docSnap.data()?.addedAt?.toDate(),
        dueAt: docSnap.data()?.dueAt?.toDate(),
    } as Vocab;
}

/**
 * Update a vocab
 */
export async function updateVocab(
    userId: string,
    vocabId: string,
    data: CreateVocabInput,
): Promise<Vocab> {
    const vocabRef = doc(db, "users", userId, "vocabs", vocabId);

    await updateDoc(vocabRef, {
        word: data.word,
        meaningVi: data.meaningVi,
        explanationEn: data.explanationEn || "",
        notes: data.notes || "",
        tags: data.tags || [],
    });

    const docSnap = await getDoc(vocabRef);

    return {
        id: vocabId,
        ...docSnap.data(),
        addedAt: docSnap.data()?.addedAt?.toDate(),
        lastReviewedAt: docSnap.data()?.lastReviewedAt?.toDate(),
        dueAt: docSnap.data()?.dueAt?.toDate(),
    } as Vocab;
}

/**
 * Delete a vocab
 */
export async function deleteVocab(
    userId: string,
    vocabId: string,
): Promise<void> {
    const vocabRef = doc(db, "users", userId, "vocabs", vocabId);
    await deleteDoc(vocabRef);
}

/**
 * Toggle suspend status
 */
export async function toggleSuspendVocab(
    userId: string,
    vocabId: string,
): Promise<void> {
    const vocabRef = doc(db, "users", userId, "vocabs", vocabId);
    const docSnap = await getDoc(vocabRef);

    if (docSnap.exists()) {
        const currentStatus = docSnap.data().isSuspended || false;
        await updateDoc(vocabRef, {
            isSuspended: !currentStatus,
        });
    }
}
