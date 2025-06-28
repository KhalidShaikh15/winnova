import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (user) {
        try {
          const adminDocRef = doc(firestore, 'admins', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists() && adminDocSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  return { user, isAdmin, loading: authLoading || loading };
}
