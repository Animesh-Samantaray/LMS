import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../configs/firebase";
import api from "../services/api.service";
import { getDashboardPath } from "../utils/auth";

export { getDashboardPath };

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [lmsProfileMissing, setLmsProfileMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch MongoDB LMS user using the currently authenticated
   * Firebase user.
   *
   * IMPORTANT:
   * AuthContext is the ONLY place that automatically calls /me.
   */
  const fetchLmsUser = useCallback(async (fbUser) => {
    if (!fbUser) {
      setUser(null);
      setFirebaseUser(null);
      setLmsProfileMissing(false);
      setLoading(false);
      return null;
    }

    setFirebaseUser(fbUser);
    setLoading(true);

    try {
      console.log(
        "[AuthContext] Fetching LMS user | UID:",
        fbUser.uid,
        "| Email:",
        fbUser.email
      );

      const response = await api.get("/api/auth/me");

      const dbUser = response.data?.user || response.data;

      if (!dbUser) {
        throw new Error("Invalid LMS user response");
      }

      const mergedUser = {
        ...fbUser,
        ...dbUser,
        firebaseUid: fbUser.uid,
        role: dbUser.role,
      };

      setUser(mergedUser);
      setLmsProfileMissing(false);

      console.log(
        "[AuthContext] LMS user loaded | Role:",
        dbUser.role
      );

      return mergedUser;
    } catch (error) {
      const status =
        error?.response?.status ??
        error?.status;

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unknown error";

      console.log(
        "[AuthContext] /api/auth/me failed | Status:",
        status,
        "| Message:",
        message
      );

      /**
       * Firebase authentication succeeded,
       * but MongoDB LMS account does not exist.
       *
       * This is NOT a Firebase logout condition.
       */
      if (status === 404) {
        setUser(null);
        setFirebaseUser(fbUser);
        setLmsProfileMissing(true);

        return null;
      }

      /**
       * Account exists but is inactive/suspended.
       */
      if (status === 403) {
        setUser({
          ...fbUser,
          firebaseUid: fbUser.uid,
          accountStatus: "inactive",
          role: null,
        });

        setFirebaseUser(fbUser);
        setLmsProfileMissing(false);

        return null;
      }

      /**
       * Network/server/authentication error.
       * Keep Firebase user available but don't pretend
       * that the LMS account was successfully loaded.
       */
      setUser(null);
      setFirebaseUser(fbUser);
      setLmsProfileMissing(false);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Firebase authentication listener.
   *
   * This is the single source of truth for authentication state.
   */
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!mounted) return;

      await fetchLmsUser(fbUser);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchLmsUser]);

  /**
   * Manually refresh the MongoDB LMS user.
   *
   * Useful immediately after successful registration,
   * profile update, role/profile creation, etc.
   */
  const refreshUser = useCallback(async () => {
    const currentFirebaseUser = auth.currentUser;

    if (!currentFirebaseUser) {
      setUser(null);
      setFirebaseUser(null);
      setLmsProfileMissing(false);
      return null;
    }

    return await fetchLmsUser(currentFirebaseUser);
  }, [fetchLmsUser]);

  /**
   * Logout from Firebase.
   *
   * Firebase auth state listener will automatically
   * clear the LMS state as well.
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("[AuthContext] Logout failed:", error);
      throw error;
    }
  }, []);

  const isAuthenticated = Boolean(
    user &&
    user.role &&
    !lmsProfileMissing
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        firebaseUser,

        loading,

        lmsProfileMissing,

        isAuthenticated,

        refreshUser,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};