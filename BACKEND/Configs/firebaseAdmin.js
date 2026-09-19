import { initializeApp } from "firebase-admin/app";

const firebaseAdmin = initializeApp({
  projectId: "our-lms-platform",
});

export default firebaseAdmin;