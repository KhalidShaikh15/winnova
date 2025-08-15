import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      if (!firestore) {
        console.warn("Firestore not initialized, cannot check admin status.");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

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
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  return { isAdmin, loading };
}
