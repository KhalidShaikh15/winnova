import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function will run when auth state is resolved.
    const checkAdminStatus = async () => {
      // If there's no user, they can't be an admin.
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      // If firestore isn't configured, we can't check.
      if (!firestore) {
        console.warn("Firestore not initialized, cannot check admin status.");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // If we have a user, check their admin status in the database.
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
        // Mark loading as false only after the check is complete.
        setLoading(false);
      }
    };

    // When the authentication is still loading, we do nothing and wait.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Once authentication is done, run the admin check.
    checkAdminStatus();
    
  }, [user, authLoading]);

  return { isAdmin, loading };
}
