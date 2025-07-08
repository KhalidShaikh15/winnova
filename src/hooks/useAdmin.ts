import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Wait for authentication to complete
      return;
    }

    if (!user) {
      // No user, so not an admin
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    // User is authenticated, now check for admin role
    const checkAdminStatus = async () => {
      // Ensure firestore is initialized before using it
      if (!firestore) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        console.warn("Firestore not initialized, cannot check admin status.");
        return;
      }
      
      setIsAdminLoading(true);
      const adminDocRef = doc(firestore, 'admins', user.uid);
      
      try {
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
        setIsAdminLoading(false);
      }
    };
    
    checkAdminStatus();
      
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || isAdminLoading };
}
