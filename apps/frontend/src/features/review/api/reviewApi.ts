import {
    collection,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase.config";

/**
 * Review Firebase Service
 * Replaces the HTTP-based review service with Firestore
 * Implements the SRS (Spaced Repetition System) algorithm
 */

export type ReviewResult = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface ReviewQueueParams {
    take?: number;
    dueBefore?: string;
}

export interface ReviewQueueVocab {
    id: string;
    word: string;
    meaningVi: string;
    explanationEn?: string;
    tags: string[];
    dueAt: Date;
    intervalDays: number;
    ease: number;
    repetitions: number;
    lapses: number;
}

export interface ReviewQueueResponse {
    items: ReviewQueueVocab[];
    count: number;
}

export interface SubmitReviewBody {
    result: ReviewResult;
    durationSec?: number;
    notes?: string;
}

export interface SubmitReviewResponse {
    vocab: ReviewQueueVocab;
    review: {
        id: string;
        result: ReviewResult;
        reviewedAt: Date;
    };
}

/**
 * Fetch review queue - vocabs that are due for review
 */
export async function fetchReviewQueue(
    userId: string,
    params: ReviewQueueParams = {},
): Promise<ReviewQueueResponse> {
    const { take = 20, dueBefore } = params;

    const vocabsRef = collection(db, "users", userId, "vocabs");
    const dueDate = dueBefore ? new Date(dueBefore) : new Date();

    const q = query(
        vocabsRef,
        where("isSuspended", "==", false),
        where("dueAt", "<=", Timestamp.fromDate(dueDate)),
        orderBy("dueAt", "asc"),
        firestoreLimit(take),
    );

    const snapshot = await getDocs(q);

    const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueAt: doc.data().dueAt?.toDate(),
    })) as ReviewQueueVocab[];

    return {
        items,
        count: items.length,
    };
}

/**
 * Submit a review and update vocab SRS fields
 */
export async function submitReview(
    userId: string,
    vocabId: string,
    body: SubmitReviewBody,
): Promise<SubmitReviewResponse> {
    const vocabRef = doc(db, "users", userId, "vocabs", vocabId);
    const reviewsRef = collection(db, "users", userId, "vocabs", vocabId, "reviews");

    // Create review record
    const reviewData = {
        result: body.result,
        reviewedAt: Timestamp.now(),
        durationSec: body.durationSec || 0,
        notes: body.notes || "",
    };

    const reviewDoc = await addDoc(reviewsRef, reviewData);

    // Calculate new SRS values based on SM-2 algorithm (simplified)
    const vocabSnap = await getDocs(query(collection(db, "users", userId, "vocabs"), where("__name__", "==", vocabId), firestoreLimit(1)));
    const vocabData = vocabSnap.docs[0]?.data();

    if (!vocabData) {
        throw new Error("Vocab not found");
    }

    const { ease, intervalDays, repetitions, lapses } = vocabData;
    const newSRS = calculateSRS(body.result, ease, intervalDays, repetitions, lapses);

    // Update vocab with new SRS values
    await updateDoc(vocabRef, {
        lastReviewedAt: Timestamp.now(),
        lastResult: body.result,
        dueAt: Timestamp.fromDate(newSRS.dueAt),
        intervalDays: newSRS.intervalDays,
        ease: newSRS.ease,
        repetitions: newSRS.repetitions,
        lapses: newSRS.lapses,
    });

    return {
        vocab: {
            id: vocabId,
            ...vocabData,
            ...newSRS,
            dueAt: newSRS.dueAt,
        } as ReviewQueueVocab,
        review: {
            id: reviewDoc.id,
            result: body.result,
            reviewedAt: new Date(),
        },
    };
}

/**
 * Calculate new SRS values using simplified SM-2 algorithm
 */
function calculateSRS(
    result: ReviewResult,
    currentEase: number,
    currentInterval: number,
    currentRepetitions: number,
    currentLapses: number,
): {
    ease: number;
    intervalDays: number;
    repetitions: number;
    lapses: number;
    dueAt: Date;
} {
    let ease = currentEase;
    let intervalDays = currentInterval;
    let repetitions = currentRepetitions;
    let lapses = currentLapses;

    switch (result) {
        case "AGAIN":
            // Reset progress
            repetitions = 0;
            intervalDays = 0;
            lapses += 1;
            ease = Math.max(130, ease - 20); // Decrease ease, min 1.3
            break;

        case "HARD":
            // Slight progress
            ease = Math.max(130, ease - 15);
            intervalDays = Math.max(1, Math.floor(intervalDays * 1.2));
            repetitions += 1;
            break;

        case "GOOD":
            // Normal progress
            if (repetitions === 0) {
                intervalDays = 1;
            } else if (repetitions === 1) {
                intervalDays = 6;
            } else {
                intervalDays = Math.floor(intervalDays * (ease / 100));
            }
            repetitions += 1;
            break;

        case "EASY":
            // Fast progress
            ease = Math.min(250, ease + 15); // Increase ease, max 2.5
            if (repetitions === 0) {
                intervalDays = 4;
            } else {
                intervalDays = Math.floor(intervalDays * (ease / 100) * 1.3);
            }
            repetitions += 1;
            break;
    }

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + intervalDays);

    return {
        ease,
        intervalDays,
        repetitions,
        lapses,
        dueAt,
    };
}
