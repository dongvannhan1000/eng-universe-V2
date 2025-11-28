import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { setDocument, getDocument } from "@/services/firestore.service";

/**
 * Firebase Authentication Service
 * Replaces the HTTP-based auth API with Firebase Auth
 */

export interface User {
    uid: string;
    email: string;
    name?: string;
    createdAt?: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name?: string;
}

/**
 * Login with email and password
 * Replaces: POST /auth/login
 */
export async function loginWithEmail(
    email: string,
    password: string,
): Promise<User> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password,
        );
        return mapFirebaseUser(userCredential.user);
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Register a new user with email and password
 * Replaces: POST /auth/register
 */
export async function registerWithEmail(
    data: RegisterData,
): Promise<{ message: string; user: User }> {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password,
        );

        // Update user profile with display name
        if (data.name) {
            await updateProfile(userCredential.user, {
                displayName: data.name,
            });
        }

        // Create user document in Firestore for additional profile data
        const user = mapFirebaseUser(userCredential.user, data.name);
        await setDocument("users", user.uid, {
            email: user.email,
            name: user.name || "",
            createdAt: new Date().toISOString(),
        });

        return {
            message: "User registered successfully",
            user,
        };
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Send password reset email
 * Replaces: POST /auth/forgot-password
 */
export async function resetPassword(email: string): Promise<{ message: string }> {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            message: "If the email exists, a reset link will be sent",
        };
    } catch (error: any) {
        // Don't reveal if email exists or not for security
        return {
            message: "If the email exists, a reset link will be sent",
        };
    }
}

/**
 * Get current authenticated user
 * Replaces: GET /auth/profile
 */
export async function getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    // Try to get additional user data from Firestore
    const userDoc = await getDocument<User>("users", currentUser.uid);

    return mapFirebaseUser(currentUser, userDoc?.name);
}

/**
 * Logout current user
 * Replaces: POST /auth/logout
 */
export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

/**
 * Listen to auth state changes
 * This provides real-time authentication status
 */
export function onAuthStateChanged(
    callback: (user: User | null) => void,
): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Get additional user data from Firestore
            const userDoc = await getDocument<User>("users", firebaseUser.uid);
            const user = mapFirebaseUser(firebaseUser, userDoc?.name);
            callback(user);
        } else {
            callback(null);
        }
    });
}

/**
 * Helper: Map Firebase User to our User type
 */
function mapFirebaseUser(
    firebaseUser: FirebaseUser,
    name?: string,
): User {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: name || firebaseUser.displayName || undefined,
    };
}

/**
 * Helper: Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        "auth/invalid-email": "Invalid email address",
        "auth/user-disabled": "This account has been disabled",
        "auth/user-not-found": "Invalid email or password",
        "auth/wrong-password": "Invalid email or password",
        "auth/email-already-in-use": "Email already in use",
        "auth/weak-password": "Password should be at least 6 characters",
        "auth/network-request-failed": "Network error. Please check your connection",
        "auth/too-many-requests": "Too many requests. Please try again later",
        "auth/operation-not-allowed": "Operation not allowed",
    };

    return errorMessages[errorCode] || "Authentication failed. Please try again";
}
