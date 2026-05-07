import { initializeApp } from 'firebase/app';
import { type Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';

import { getPublicConfig } from './publicConfig';

const publicConfig = getPublicConfig();
const firebaseConfig = {
  apiKey: publicConfig.firebaseApiKey,
  authDomain: publicConfig.firebaseAuthDomain,
  projectId: publicConfig.firebaseProjectId,
  storageBucket: publicConfig.firebaseStorageBucket,
  messagingSenderId: publicConfig.firebaseMessagingSenderId,
  appId: publicConfig.firebaseAppId,
  firestoreDatabaseId: publicConfig.firebaseFirestoreDatabaseId,
};

// Simple validation
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'firestoreDatabaseId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    `Missing Firebase configuration keys: ${missingKeys.join(', ')}. Firebase features may not work.`,
  );
}

const app = missingKeys.length > 0 ? null : initializeApp(firebaseConfig);
export const auth: Auth | null = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Required scope for Google Calendar if we want to use the same auth flow
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
