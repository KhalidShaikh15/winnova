
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament } from '@/lib/types';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Award, Calendar, Group, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export default function TournamentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        // Fetch All Tournaments
        const tournamentsCollection = collection(firestore, 'tournaments');
        const q = query(tournamentsCollection, orderBy('tournament_date', 'desc'));
        const tournamentsSnapshot = await getDocs(q);
        
        const tournamentsList = tournamentsSnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          } as Tournament;
        });

        setTournaments(tournamentsList);

      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
        fetchData();
    }

  }, [authLoading]);

  return (
    <div className="container py-12">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">All Tournaments</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
          Browse our full list of tournaments. Find your game, join the fight, and claim victory.
        </p>
      </div>

      {(loading || authLoading) ? (
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      ) : !user ? (
        <p className="text-center text-muted-foreground">Please <Link href="/login" className="underline font-semibold">log in</Link> to view available tournaments.</p>
      ) : tournaments.length === 0 ? (
        <p className="text-center text-muted-foreground">No tournaments found. Check back soon!</p>
      ) : (
        <div className="space-y-8">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="w-full transition-all hover:shadow-md">
              <Link href={`/tournaments/${tournament.id}`}>
                <div className="grid grid-cols-1 md:grid-cols-5 items-center p-4 gap-4">
                  <div className="md:col-span-1">
                    <Image src={tournament.banner_url || 'https://placehold.co/150x100.png'} alt={tournament.title} width={150} height={100} className="rounded-lg object-cover w-full h-auto aspect-video"/>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{tournament.title}</CardTitle>
                      <Badge variant={tournament.status === 'upcoming' ? 'default' : tournament.status === 'completed' ? 'secondary' : 'destructive'}>
                        {tournament.status}
                      </Badge>
                    </div>
                    <CardDescription>{tournament.game_name}</CardDescription>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4"/>
                      <span>{format(tournament.tournament_date.toDate(), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4"/>
                      <span>₹{tournament.prize_pool.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4"/>
                      <span>Fee: ₹{tournament.entry_fee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Group className="w-4 h-4"/>
                      <span>{tournament.match_type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
