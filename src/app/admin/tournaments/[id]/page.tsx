
'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Registration } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Trash2, ChevronRight, User, Phone, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!params.id || !firestore) return;

    setLoading(true);
    // Fetch static tournament data once
    const tournamentDocRef = doc(firestore, 'tournaments', params.id);
    getDoc(tournamentDocRef).then(tournamentSnap => {
        if (!tournamentSnap.exists()) {
            notFound();
            return;
        }
        setTournament({ id: tournamentSnap.id, ...tournamentSnap.data() } as Tournament);
    }).catch(error => {
        console.error("Error fetching tournament data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch tournament data.' });
    });

    // Set up real-time listener for registrations
    const regsQuery = query(
        collection(firestore, 'registrations'), 
        where('tournament_id', '==', params.id)
    );

    const unsubscribe = onSnapshot(regsQuery, (querySnapshot) => {
        let regsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        regsList = regsList.sort((a, b) => (b.created_at?.toMillis() || 0) - (a.created_at?.toMillis() || 0));
        setRegistrations(regsList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching registrations:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch registrations.' });
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [params.id, toast]);

   const handleSlotChange = async (regId: string, slot: string) => {
    if (!firestore || !tournament) return;
    setUpdatingSlotRegId(regId);
    try {
      const regDocRef = doc(firestore, 'registrations', regId);
      await updateDoc(regDocRef, { slot });
      // State will update via the onSnapshot listener, but we can optimistically update UI
      const updatedRegs = regs => regs.map(r => (r.id === regId ? { ...r, slot } : r));
      setRegistrations(updatedRegs);
      setSelectedRegistration(prev => prev ? {...prev, slot} : null);
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

    setConfirmingRegId(regId);

    try {
      const regDocRef = doc(firestore, 'registrations', regId);
      await updateDoc(regDocRef, { status });
      // State will update via the onSnapshot listener
      setSelectedRegistration(prev => prev ? {...prev, status} : null);
      toast({ title: 'Success', description: `Registration has been ${status}.` });

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update registration status.' });
    } finally {
      setConfirmingRegId(null);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration || !firestore) return;
    setIsDeleting(true);
    try {
      const regDocRef = doc(firestore, 'registrations', selectedRegistration.id);
      await deleteDoc(regDocRef);

      toast({ title: 'Success', description: 'Registration deleted.' });
      // State will update via the onSnapshot listener
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete registration.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedRegistration(null);
      setIsSheetOpen(false);
    }
  };

  const handleOpenSheet = (reg: Registration) => {
    setSelectedRegistration(reg);
    setIsSheetOpen(true);
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!tournament) {
    return notFound();
  }

  const renderMobileCards = () => (
    <div className="space-y-4">
        {registrations.length > 0 ? (
            registrations.map(reg => (
                <Card key={reg.id} className="bg-muted/30">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="font-bold">{reg.squad_name}</span>
                           <Badge variant={reg.status === 'pending' ? 'secondary' : reg.status === 'confirmed' ? 'default' : 'destructive'} className="w-fit mt-1">{reg.status}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenSheet(reg)}>
                           <ChevronRight className="h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            ))
        ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">No registrations yet.</CardContent>
            </Card>
        )}
    </div>
  );

  const renderDesktopTable = () => (
    <Table>
        <TableHeader>
        <TableRow>
            <TableHead>Squad Name</TableHead>
            <TableHead className="hidden lg:table-cell">Player IDs</TableHead>
            <TableHead className="hidden xl:table-cell">Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Slot</TableHead>
            <TableHead className="hidden xl:table-cell">User UPI ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
        {registrations.length > 0 ? (
            registrations.map(reg => (
            <TableRow key={reg.id}>
                <TableCell className="font-medium whitespace-nowrap">{reg.squad_name}</TableCell>
                <TableCell className="hidden lg:table-cell">
                <ul className="list-disc list-inside text-xs">
                    {Array.isArray(reg.players) ? reg.players.map(p => <li key={p.game_id}>{p.game_id}</li>) : <li>No players listed</li>}
                </ul>
                </TableCell>
                <TableCell className="hidden xl:table-cell">{reg.contact_number}</TableCell>
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
                    <SelectTrigger className="w-[80px] h-9">
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
                <TableCell className="hidden xl:table-cell">
                <span className="font-mono text-xs">{reg.user_upi_id || 'N/A'}</span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                <Button size="sm" variant="outline" disabled={reg.status === 'confirmed' || confirmingRegId === reg.id} onClick={() => handleRegistrationStatus(reg.id, 'confirmed')}>
                    {confirmingRegId === reg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="destructive" disabled={reg.status === 'rejected'} onClick={() => handleRegistrationStatus(reg.id, 'rejected')}>
                    <XCircle className="h-4 w-4" />
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
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold truncate">Manage: {tournament.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Registrations</span>
            <Badge variant="secondary">{registrations.length} / {tournament.max_teams} registered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="md:hidden">
            {renderMobileCards()}
          </div>
          <div className="hidden md:block overflow-x-auto">
            {renderDesktopTable()}
          </div>
        </CardContent>
      </Card>
      
      {selectedRegistration && (
         <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>{selectedRegistration.squad_name}</SheetTitle>
                    <SheetDescription>
                        Registration details for this team.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-4 flex-grow overflow-y-auto">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4"/>Contact Info</h4>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4"/> {selectedRegistration.contact_number}</p>
                        <p className="font-mono text-sm break-all">{selectedRegistration.user_upi_id || 'No UPI ID'}</p>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-muted-foreground"><List className="h-4 w-4"/>Player IDs</h4>
                        <ul className="list-disc list-inside text-sm">
                            {Array.isArray(selectedRegistration.players) ? selectedRegistration.players.map(p => <li key={p.game_id}>{p.game_id}</li>) : <li>No players listed</li>}
                        </ul>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-muted-foreground">Status & Slot</h4>
                        <div className="flex items-center gap-4">
                           <Badge variant={selectedRegistration.status === 'pending' ? 'secondary' : selectedRegistration.status === 'confirmed' ? 'default' : 'destructive'} className="w-fit">{selectedRegistration.status}</Badge>
                            <Select
                                value={selectedRegistration.slot}
                                onValueChange={(value) => handleSlotChange(selectedRegistration.id, value)}
                                disabled={updatingSlotRegId === selectedRegistration.id}
                            >
                                <SelectTrigger className="w-[100px] h-9">
                                    <SelectValue placeholder="Slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SLOTS.map(slot => (
                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t">
                    <Button variant="outline" disabled={selectedRegistration.status === 'confirmed' || confirmingRegId === selectedRegistration.id} onClick={() => handleRegistrationStatus(selectedRegistration.id, 'confirmed')}>
                        {confirmingRegId === selectedRegistration.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Confirm
                    </Button>
                    <Button variant="destructive" disabled={selectedRegistration.status === 'rejected'} onClick={() => handleRegistrationStatus(selectedRegistration.id, 'rejected')}>
                        <XCircle className="h-4 w-4" />
                        Reject
                    </Button>
                    <Button variant="destructive" className="col-span-2" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Delete Registration
                    </Button>
                </div>
            </SheetContent>
         </Sheet>
      )}

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
