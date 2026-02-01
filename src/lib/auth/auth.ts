import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/config";

/**
 * Signs up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    let errorMessage = "Failed to create account";
    if (error instanceof Error && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists";
      } else if (code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password";
      } else if (code === "auth/operation-not-allowed") {
        errorMessage = "Account creation is not allowed. Please contact support";
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
}

/**
 * Signs in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    let errorMessage = "Failed to sign in";

    if (error instanceof Error && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials and try again";
      } else if (code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      } else if (code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support";
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sign out";
    throw new Error(message);
  }
}

/**
 * Gets the currently authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribes to authentication state changes
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}
