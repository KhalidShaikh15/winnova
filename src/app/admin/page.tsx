'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CreateTournamentDialog from '@/components/admin/CreateTournamentDialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchGames = async () => {
    const gamesCollection = collection(firestore, 'games');
    const gamesSnapshot = await getDocs(gamesCollection);
    const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Game[];
    setGames(gamesList);
  };
  
  const fetchTournaments = async () => {
    setLoading(true);
    const tournamentsCollection = collection(firestore, 'tournaments');
    const q = query(tournamentsCollection, orderBy('tournament_date', 'desc'));
    const tournamentsSnapshot = await getDocs(q);
    const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
    setTournaments(tournamentsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
    fetchTournaments();
  }, []);

  const handleTournamentCreated = () => {
    fetchTournaments();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tournament Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create Tournament</Button>
      </div>

      <CreateTournamentDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        games={games}
        onTournamentCreated={handleTournamentCreated}
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
                <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/tournaments/${t.id}`}>Manage</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
