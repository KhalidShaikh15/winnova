import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, app } from '@/lib/firebase';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Wait for authentication to complete
      return;
    }

    // Also wait for firebase to be initialized on the client
    if (!user || !app) {
      // No user or no firebase, so not an admin
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    // User is authenticated, now check for admin role
    setIsAdminLoading(true);
    const adminDocRef = doc(firestore, 'admins', user.uid);
    
    getDoc(adminDocRef)
      .then(adminDocSnap => {
        if (adminDocSnap.exists() && adminDocSnap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(error => {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      })
      .finally(() => {
        setIsAdminLoading(false);
      });
      
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || isAdminLoading };
}
