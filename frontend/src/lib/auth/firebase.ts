import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const requiredFirebaseConfiguration = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseConfiguration() {
  if (Object.values(requiredFirebaseConfiguration).some((value) => !value)) {
    throw new Error("Firebase chưa được cấu hình cho ứng dụng này.");
  }

  return requiredFirebaseConfiguration as Required<typeof requiredFirebaseConfiguration>;
}

export function getFirebaseAuth() {
  const application = getApps().length === 0 ? initializeApp(getFirebaseConfiguration()) : getApp();

  return getAuth(application);
}
