import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

// Simple validation
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== "firestoreDatabaseId") // databaseId is often optional in initialization but useful for specific applets
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    `Missing Firebase configuration keys: ${missingKeys.join(", ")}. Firebase features may not work.`,
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Required scope for Google Calendar if we want to use the same auth flow
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");
