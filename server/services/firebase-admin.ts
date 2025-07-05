import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, use service account key file
  // For development, use environment variables
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error("Firebase project ID not found in environment variables");
  }

  admin.initializeApp({
    projectId: projectId,
    // In production, add service account credentials here
    // credential: admin.credential.cert(serviceAccount),
  });
}

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    throw new Error("Invalid Firebase token");
  }
}

export { admin };
