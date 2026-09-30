import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

import { auth } from "../configs/firebase.js";

export const register = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const googleLogin = () => {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  return signInWithPopup(auth, provider);
};

export const githubLogin = () => {
  const provider = new GithubAuthProvider();

  return signInWithPopup(auth, provider);
};

export const logout = () => signOut(auth);

export const forgotPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const verifyEmail = () => {
  if (!auth.currentUser) {
    throw new Error("No logged-in user");
  }

  return sendEmailVerification(auth.currentUser);
};

export const getAuthErrorMessage = (error, fallback) => {
  const messages = {
    "auth/email-already-in-use":
      "An account already exists with this email address.",

    "auth/invalid-credential":
      "Invalid email or password. Please try again.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/operation-not-allowed":
      "This sign-in method is not enabled yet.",

    "auth/popup-closed-by-user":
      "The sign-in window was closed before authentication finished.",

    "auth/popup-blocked":
      "Your browser blocked the sign-in window. Please allow popups and try again.",

    "auth/cancelled-popup-request":
      "Another sign-in window is already active. Please finish or close it and try again.",

    "auth/weak-password":
      "Password must be at least 6 characters.",

    "auth/network-request-failed":
      "Network connection to the authentication provider failed. Please check your internet connection, disable ad-blockers for popups, and try again.",

    "auth/account-exists-with-different-credential":
      "An account already exists with the same email address but different sign-in credentials. Sign in using the provider associated with this email address.",

    "auth/unauthorized-domain":
      "This domain is not authorized in Firebase Console for OAuth operations. Please add localhost to Authorized Domains in Firebase Authentication Settings.",

    "auth/user-disabled":
      "This account has been disabled.",

    "auth/user-not-found":
      "No account was found with this email address.",

    "auth/too-many-requests":
      "Too many attempts. Please wait and try again later.",
  };

  return messages[error?.code] || error?.message || fallback;
};