
'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Award, Calendar, Group, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export default function GameDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) {
        setLoading(false);
        return;
    };

    const fetchGameData = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        const gameDocRef = doc(firestore, 'games', params.id);
        const gameSnap = await getDoc(gameDocRef);

        let gameData: Game;
        if (!gameSnap.exists()) {
          if (params.id === 'fc25') {
            gameData = {
              id: 'fc25',
              name: 'FC25',
              max_players: 0,
              platform: 'Cross-platform',
              active: true,
              imageUrl: '',
              aiHint: '',
            };
            setGame(gameData);
          } else {
            notFound();
            return;
          }
        } else {
            gameData = { id: gameSnap.id, ...gameSnap.data() } as Game;
            setGame(gameData);
        }

        const gameNameToFilter = gameData.name;
        
        // Fetch all tournaments and filter on the client
        const tournamentsQuery = query(
            collection(firestore, 'tournaments'),
            orderBy('tournament_date', 'desc')
        );
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        const tournamentsList = tournamentsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Tournament))
            .filter(t => t.game_name === gameNameToFilter);
            
        setTournaments(tournamentsList);

      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
    
  }, [params.id]);

  if (loading || authLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return notFound();
  }

  return (
    <div className="container py-12">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">{game.name}</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Browse all tournaments for {game.name}. Find your next challenge!
        </p>
      </div>
      
       <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Available Tournaments</h2>
        {tournaments.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming tournaments for {game.name}. Check back soon!</p>
        ) : (
            tournaments.map((tournament) => (
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
            ))
        )}
       </div>

    </div>
  );
}
