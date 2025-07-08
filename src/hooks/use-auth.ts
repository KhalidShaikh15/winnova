'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure Firebase auth is initialized before using it
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // Firebase is not initialized (e.g., on server or missing config)
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
