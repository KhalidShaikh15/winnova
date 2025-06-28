'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Registration } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ManageTournamentPage({ params }: { params: { id: string } }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTournamentAndRegistrations = async () => {
      setLoading(true);
      try {
        const tournamentDocRef = doc(firestore, 'tournaments', params.id);
        const tournamentSnap = await getDoc(tournamentDocRef);

        if (!tournamentSnap.exists()) {
          notFound();
          return;
        }
        setTournament({ id: tournamentSnap.id, ...tournamentSnap.data() } as Tournament);

        const regsQuery = query(collection(firestore, 'registrations'), where('tournament_id', '==', params.id));
        const regsSnapshot = await getDocs(regsQuery);
        const regsList = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        setRegistrations(regsList);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch tournament data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentAndRegistrations();
  }, [params.id, toast]);

  const handleRegistrationStatus = async (regId: string, status: 'confirmed' | 'rejected') => {
    try {
      const regDocRef = doc(firestore, 'registrations', regId);
      await updateDoc(regDocRef, { status });
      setRegistrations(regs => regs.map(r => r.id === regId ? { ...r, status } : r));
      toast({ title: 'Success', description: `Registration has been ${status}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update registration status.' });
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!tournament) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage: {tournament.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Squad Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length > 0 ? (
                registrations.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.squad_name}</TableCell>
                    <TableCell>{reg.contact_number}</TableCell>
                    <TableCell><Badge variant={reg.status === 'pending' ? 'secondary' : reg.status === 'confirmed' ? 'default' : 'destructive'}>{reg.status}</Badge></TableCell>
                    <TableCell>
                      <a href={reg.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                        <Image src={reg.payment_screenshot_url} width={80} height={80} alt="Payment" className="rounded-md" />
                      </a>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="icon" variant="ghost" disabled={reg.status === 'confirmed'} onClick={() => handleRegistrationStatus(reg.id, 'confirmed')}>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" disabled={reg.status === 'rejected'} onClick={() => handleRegistrationStatus(reg.id, 'rejected')}>
                        <XCircle className="h-5 w-5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No registrations yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
