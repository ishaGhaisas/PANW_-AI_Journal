import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

/**
 * Initializes Firebase Admin SDK for server-side operations (lazy initialization)
 */
function initializeAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!privateKey || !clientEmail || !projectId) {
    const missing = [];
    if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!projectId) missing.push("FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    
    throw new Error(
      `Missing Firebase Admin configuration. Please set the following environment variables: ${missing.join(", ")}`
    );
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });

  return adminApp;
}

/**
 * Gets Firestore instance for server-side operations (lazy initialization)
 */
export function getAdminFirestore(): Firestore {
  initializeAdminApp();
  return getFirestore();
}

export default initializeAdminApp;
