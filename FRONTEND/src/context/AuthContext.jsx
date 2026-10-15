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
import { disconnectSocket } from "../services/socket.service";

export { getDashboardPath };

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [lmsProfileMissing, setLmsProfileMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);

  const loadAuthState = useCallback(async (fbUser, explicitToken = null) => {
    if (!fbUser) {
      setUser(null);
      setFirebaseUser(null);
      setLmsProfileMissing(false);
      setTwoFactorRequired(false);
      setTwoFactorVerified(false);
      setLoading(false);
      return null;
    }

    setFirebaseUser(fbUser);
    setLoading(true);

    try {
      console.log(
        `[AuthContext] Firebase user detected | UID: ${fbUser.uid} | Email: ${fbUser.email}`
      );

      const token = explicitToken || (await fbUser.getIdToken());
      console.log("[AuthContext] Fetching LMS user profile...");

      const response = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      setFirebaseUser(fbUser);
      setLmsProfileMissing(false);
      setTwoFactorRequired(false);
      setTwoFactorVerified(true);

      console.log(
        "[AuthContext] LMS user loaded | Role:",
        dbUser.role
      );

      return mergedUser;
    } catch (error) {
      const status =
        error?.response?.status ??
        error?.status;

      const code =
        error?.response?.data?.code;

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unknown error";

      console.log(
        "[AuthContext] Authentication flow status:",
        {
          status,
          code,
          message,
        }
      );

      if (status === 404) {
        setUser(null);
        setFirebaseUser(fbUser);
        setLmsProfileMissing(true);
        setTwoFactorRequired(false);
        setTwoFactorVerified(false);
        return null;
      }

      if (
        status === 403 &&
        code === "TWO_FACTOR_REQUIRED"
      ) {
        try {
          const token = explicitToken || (await fbUser.getIdToken());
          await api.post(
            "/api/auth/2fa/check",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (otpErr) {
          console.warn("[AuthContext] 2FA check trigger error:", otpErr?.message);
        }

        setUser(null);
        setFirebaseUser(fbUser);
        setLmsProfileMissing(false);
        setTwoFactorRequired(true);
        setTwoFactorVerified(false);
        return null;
      }

      if (status === 403) {
        setUser({
          ...fbUser,
          firebaseUid: fbUser.uid,
          accountStatus: "inactive",
          role: null,
        });

        setFirebaseUser(fbUser);
        setLmsProfileMissing(false);
        setTwoFactorRequired(false);
        setTwoFactorVerified(false);
        return null;
      }

      setUser(null);
      setFirebaseUser(fbUser);
      setLmsProfileMissing(false);
      setTwoFactorRequired(false);
      setTwoFactorVerified(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        if (!mounted) return;

        console.log(
          "[AuthContext] Firebase auth state changed:",
          fbUser ? fbUser.email : "logged out"
        );

        await loadAuthState(fbUser);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadAuthState]);

  const refreshUser = useCallback(
    async (targetFbUser = null, explicitToken = null) => {
      const currentFirebaseUser = targetFbUser || auth.currentUser;

      if (!currentFirebaseUser) {
        setUser(null);
        setFirebaseUser(null);
        setLmsProfileMissing(false);
        setTwoFactorRequired(false);
        setTwoFactorVerified(false);
        setLoading(false);
        return null;
      }

      return await loadAuthState(currentFirebaseUser, explicitToken);
    },
    [loadAuthState]
  );

  const logout = useCallback(async () => {
    try {
      try {
        await api.post("/api/auth/logout");
      } catch (error) {
        console.warn(
          "[AuthContext] Backend logout failed:",
          error?.message
        );
      }

      await signOut(auth);
      disconnectSocket();

      setUser(null);
      setFirebaseUser(null);
      setLmsProfileMissing(false);
      setTwoFactorRequired(false);
      setTwoFactorVerified(false);
    } catch (error) {
      console.error(
        "[AuthContext] Logout failed:",
        error
      );
      throw error;
    }
  }, []);

  const isAuthenticated = Boolean(
    user &&
      user.role &&
      !lmsProfileMissing &&
      (!user.twoFactorEnabled || twoFactorVerified)
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
        loadAuthState,
        refreshUser,
        logout,
        twoFactorRequired,
        setTwoFactorRequired,
        twoFactorVerified,
        setTwoFactorVerified,
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