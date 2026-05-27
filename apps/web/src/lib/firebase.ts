import { initializeApp } from 'firebase/app';
import { type Auth, getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

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

// Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Microsoft Provider
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('Calendars.ReadWrite');

