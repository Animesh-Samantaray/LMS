import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../configs/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const role = sessionStorage.getItem('lmsRole') || 'Student';
      setUser({
        ...firebaseUser,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner',
        role,
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('lmsRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: Boolean(user), logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
