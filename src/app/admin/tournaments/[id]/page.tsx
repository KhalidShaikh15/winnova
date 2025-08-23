
'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, writeBatch, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Registration } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SLOTS = ['A', 'B', 'C', 'D', 'E'];

export default function ManageTournamentPage() {
  const params = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingRegId, setConfirmingRegId] = useState<string | null>(null);
  const [updatingSlotRegId, setUpdatingSlotRegId] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchTournamentAndRegistrations = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        const tournamentDocRef = doc(firestore, 'tournaments', params.id);
        const tournamentSnap = await getDoc(tournamentDocRef);

        if (!tournamentSnap.exists()) {
          notFound();
          return;
        }
        setTournament({ id: tournamentSnap.id, ...tournamentSnap.data() } as Tournament);

        const regsQuery = query(
            collection(firestore, 'registrations'), 
            where('tournament_id', '==', params.id),
            orderBy('created_at', 'desc')
        );

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

   const handleSlotChange = async (regId: string, slot: string) => {
    if (!firestore || !tournament) return;
    setUpdatingSlotRegId(regId);
    try {
      const regDocRef = doc(firestore, 'registrations', regId);
      await updateDoc(regDocRef, { slot });
      setRegistrations(regs => regs.map(r => (r.id === regId ? { ...r, slot } : r)));
      toast({ title: 'Success', description: `Team slot updated to ${slot}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update slot.' });
    } finally {
      setUpdatingSlotRegId(null);
    }
  };


  const handleRegistrationStatus = async (regId: string, status: 'confirmed' | 'rejected') => {
    if (!firestore || !tournament) return;

    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    if (status === 'confirmed') {
      setConfirmingRegId(regId);
    }

    try {
      const regDocRef = doc(firestore, 'registrations', regId);
      await updateDoc(regDocRef, { status });
      
      setRegistrations(regs => regs.map(r => r.id === regId ? { ...r, status } : r));
      toast({ title: 'Success', description: `Registration has been ${status}.` });


      if (status === 'confirmed' && tournament && reg.user_email) {
          const subject = `Your Registration for "${tournament.title}" is Confirmed!`;
          const body = `
Hi ${reg.username},

Congratulations! Your registration for the "${tournament.title}" tournament is confirmed.

Match Details:
- Date: ${format(tournament.tournament_date.toDate(), 'PPP')}
- Time: ${tournament.tournament_time}
- Entry Fee Paid: ₹${tournament.entry_fee}

We're excited to see you in the arena! The total prize pool is ₹${tournament.prize_pool.toLocaleString()}.

Good luck!

The Winnova Team
          `.trim().replace(/\n/g, '%0D%0A');

          const mailtoLink = `mailto:${reg.user_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailtoLink, '_blank');
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update registration status.' });
    } finally {
      if (status === 'confirmed') {
        setConfirmingRegId(null);
      }
    }
  };

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration || !firestore) return;
    setIsDeleting(true);
    try {
      const regDocRef = doc(firestore, 'registrations', selectedRegistration.id);
      await deleteDoc(regDocRef);

      toast({ title: 'Success', description: 'Registration deleted.' });
      setRegistrations(regs => regs.filter(r => r.id !== selectedRegistration.id));
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete registration.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedRegistration(null);
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
          <CardTitle className="flex items-center justify-between">
            <span>Registrations</span>
            <Badge variant="secondary">{registrations.length} / {tournament.max_teams} registered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Squad Name</TableHead>
                  <TableHead>Player IDs</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>User UPI ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length > 0 ? (
                  registrations.map(reg => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.squad_name}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                            {reg.players.map(p => <li key={p.game_id}>{p.game_id}</li>)}
                        </ul>
                      </TableCell>
                      <TableCell>{reg.contact_number}</TableCell>
                      <TableCell><Badge variant={reg.status === 'pending' ? 'secondary' : reg.status === 'confirmed' ? 'default' : 'destructive'}>{reg.status}</Badge></TableCell>
                      <TableCell>
                        {updatingSlotRegId === reg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Select
                            value={reg.slot}
                            onValueChange={(value) => handleSlotChange(reg.id, value)}
                            disabled={updatingSlotRegId === reg.id}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {SLOTS.map(slot => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{reg.user_upi_id || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="outline" disabled={reg.status === 'confirmed' || confirmingRegId === reg.id} onClick={() => handleRegistrationStatus(reg.id, 'confirmed')}>
                          {confirmingRegId === reg.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          Confirm
                        </Button>
                        <Button size="sm" variant="destructive" disabled={reg.status === 'rejected'} onClick={() => handleRegistrationStatus(reg.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center">No registrations yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the registration for
              <span className="font-bold"> &quot;{selectedRegistration?.squad_name}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRegistration} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
