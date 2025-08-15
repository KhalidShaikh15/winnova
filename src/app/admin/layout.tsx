'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/shared/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Only act once loading is complete.
    if (!loading && !isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
      });
      router.push('/');
    }
  }, [isAdmin, loading, router, toast]);

  // Show a loading spinner while the admin check is in progress.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // If the check is done and the user is an admin, render the layout.
  if (isAdmin) {
    return (
      <>
        <Header/>
        <div className="flex min-h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
        </div>
      </>
    );
  }

  // If the user is not an admin, this will be null while redirecting.
  return null;
}
