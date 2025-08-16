import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is still loading, the admin check is also loading.
    if (authLoading) {
      setLoading(true);
      return;
    }

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

    // Create a cancellable promise to fetch the admin status
    let isCancelled = false;

    const checkAdminStatus = async () => {
      try {
        const adminDocRef = doc(firestore, 'admins', user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        
        if (!isCancelled) {
          if (adminDocSnap.exists()) {
            // Check for a specific role if your document has one, e.g., adminDocSnap.data().role === 'admin'
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (!isCancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    // Cleanup function to cancel the async task on unmount
    return () => {
      isCancelled = true;
    };
    
  }, [user, authLoading]);

  return { isAdmin, loading };
}
