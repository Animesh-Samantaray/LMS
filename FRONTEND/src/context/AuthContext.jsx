import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../configs/firebase';
import api from '../services/api.service';

const AuthContext = createContext(null);

export const getDashboardPath = (role) => {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Firebase token is automatically attached by our interceptor
        const res = await api.get('/api/auth/me');
        const dbUser = res.data?.user || res.data;
        setUser({
          ...firebaseUser,
          ...dbUser, // Merge DB user properties (role, name, profileImage, etc.)
        });
      } catch (error) {
        console.error("Failed to fetch user from DB:", error);
        // Do not kick them out necessarily; maybe they haven't completed registration DB sync yet.
        setUser({
          ...firebaseUser,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner',
          role: 'Student', // Temporary fallback
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: Boolean(user), logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
