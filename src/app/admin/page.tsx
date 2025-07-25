'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc, where, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CreateTournamentDialog from './CreateTournamentDialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const fetchGames = useCallback(async () => {
    if (!firestore) return;
    const gamesCollection = collection(firestore, 'games');
    const gamesSnapshot = await getDocs(gamesCollection);
    const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Game[];
    setGames(gamesList);
  }, []);
  
  const fetchTournaments = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    const tournamentsCollection = collection(firestore, 'tournaments');
    const q = query(tournamentsCollection, orderBy('tournament_date', 'desc'));
    const tournamentsSnapshot = await getDocs(q);
    const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
    setTournaments(tournamentsList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGames();
    fetchTournaments();
  }, [fetchGames, fetchTournaments]);

  const handleFormSubmit = () => {
    fetchTournaments();
  }

  const openCreateDialog = () => {
    setEditMode(false);
    setSelectedTournament(null);
    setIsFormOpen(true);
  };
  
  const openEditDialog = (tournament: Tournament) => {
    setEditMode(true);
    setSelectedTournament(tournament);
    setIsFormOpen(true);
  };

  const handleDeleteTournament = async () => {
    if (!selectedTournament || !firestore) return;
    setIsDeleting(true);
    try {
      const regsQuery = query(collection(firestore, 'registrations'), where('tournament_id', '==', selectedTournament.id));
      const regsSnapshot = await getDocs(regsQuery);
      const batch = writeBatch(firestore);
      regsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      await deleteDoc(doc(firestore, 'tournaments', selectedTournament.id));

      toast({ title: 'Success', description: 'Tournament and all registrations deleted.' });
      fetchTournaments(); 
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete tournament.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedTournament(null);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tournament Management</h1>
        <Button onClick={openCreateDialog}>Create Tournament</Button>
      </div>

      <CreateTournamentDialog 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        games={games}
        onFormSubmit={handleFormSubmit}
        tournamentData={editMode ? selectedTournament : null}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>All Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading tournaments...</TableCell>
                </TableRow>
              ) : tournaments.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center">No tournaments found.</TableCell>
                </TableRow>
              ) : (
                tournaments.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.game_name}</TableCell>
                    <TableCell>{format(t.tournament_date.toDate(), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'upcoming' ? 'default' : t.status === 'completed' ? 'secondary' : 'destructive'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/tournaments/${t.id}`}>Manage</Link>
                      </Button>
                       <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(t)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedTournament(t);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament
              <span className="font-bold"> &quot;{selectedTournament?.title}&quot; </span>
              and all of its associated registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTournament} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
