import { initializeApp, cert, getApps } from "firebase-admin/app";

let firebaseAdmin;

if (!getApps().length) {
  const options = {
    projectId: process.env.FIREBASE_PROJECT_ID || "our-lms-platform",
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      options.credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } catch (e) {
      console.warn("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT:", e.message);
    }
  }

  firebaseAdmin = initializeApp(options);
} else {
  firebaseAdmin = getApps()[0];
}

export default firebaseAdmin;