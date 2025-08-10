'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { applyActionCode, isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginHandlerProps {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function LoginHandler({ setLoading }: LoginHandlerProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');

    if (auth && actionCode && typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        // This case is handled by Firebase for password resets automatically.
        // For email verification, it's less critical but we proceed.
      }

      setLoading(true);
      applyActionCode(auth, actionCode)
        .then(() => {
          toast({
            title: "Email Verified!",
            description: "Your email has been successfully verified. Redirecting...",
          });
          // Redirect to the main marketing site after successful verification.
          window.location.href = 'https://winnova.in';
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: error.message,
          });
          setLoading(false);
        });
    }
  }, [searchParams, toast, setLoading]);

  return null; // This component does not render anything
}
