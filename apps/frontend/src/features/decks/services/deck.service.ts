import {
    collection,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    getDocs,
    doc,
    getDoc,
    type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";

/**
 * Public Decks Firebase Service
 * Replaces the HTTP-based decks service with Firestore
 */

export interface Deck {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DeckItem {
    id: string;
    deckId: string;
    headword: string;
    pos?: string;
    definition?: string;
    tags: string[];
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedDeckItem {
    data: DeckItem[];
    total: number;
    page: number;
    limit: number;
}

/**
 * List all public decks
 */
export async function listDecks(): Promise<Deck[]> {
    const decksRef = collection(db, "publicDecks");
    const q = query(decksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as Deck[];
}

/**
 * Get deck by slug
 */
export async function getDeckBySlug(slug: string): Promise<Deck | null> {
    const decksRef = collection(db, "publicDecks");
    const q = query(decksRef, where("slug", "==", slug), firestoreLimit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docData = snapshot.docs[0];
    return {
        id: docData.id,
        ...docData.data(),
        createdAt: docData.data().createdAt?.toDate(),
        updatedAt: docData.data().updatedAt?.toDate(),
    } as Deck;
}

/**
 * Get deck by ID
 */
export async function getDeckById(id: string): Promise<Deck | null> {
    const deckRef = doc(db, "publicDecks", id);
    const docSnap = await getDoc(deckRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Deck;
}

/**
 * List deck items with pagination
 */
export async function listDeckItems(
    deckId: string,
    page = 1,
    limit = 20,
): Promise<PaginatedDeckItem> {
    const itemsRef = collection(db, "publicDecks", deckId, "items");
    const q = query(itemsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    const allItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as DeckItem[];

    // Pagination
    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const data = allItems.slice(startIndex, startIndex + limit);

    return {
        data,
        total,
        page,
        limit,
    };
}

/**
 * Preview deck - Note: This requires backend/Cloud Function for AI generation
 * For now, return an error indicating this feature needs backend support
 */
export async function previewDeck(
    topic: string,
    page = 1,
    limit = 20,
    refresh = false,
): Promise<any> {
    throw new Error(
        "Deck preview (AI generation) requires a backend Cloud Function. Please implement this using Firebase Cloud Functions.",
    );
}
