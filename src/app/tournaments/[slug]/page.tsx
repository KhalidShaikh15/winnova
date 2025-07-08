'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game, type LeaderboardEntry } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TournamentDetails from '@/app/tournaments/components/TournamentDetails';
import TournamentLeaderboard from '@/app/tournaments/components/TournamentLeaderboard';
import TournamentRegistration from '@/app/tournaments/components/TournamentRegistration';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TournamentPage() {
  const params = useParams<{ slug: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;

    const fetchTournamentData = async () => {
      if (!firestore) return;
      setLoading(true);
      try {
        const tournamentDocRef = doc(firestore, 'tournaments', params.slug);
        const tournamentSnap = await getDoc(tournamentDocRef);

        if (!tournamentSnap.exists()) {
          notFound();
          return;
        }

        const tournamentData = { id: tournamentSnap.id, ...tournamentSnap.data() } as Tournament;
        setTournament(tournamentData);

        // Fetch associated game
        const gameQuery = query(collection(firestore, 'games'), where('name', '==', tournamentData.game_name));
        const gameSnapshot = await getDocs(gameQuery);
        if (!gameSnapshot.empty) {
          const gameData = { id: gameSnapshot.docs[0].id, ...gameSnapshot.docs[0].data() } as Game;
          setGame(gameData);
        }
        
        // Fetch leaderboard data
        const leaderboardQuery = query(
            collection(firestore, "leaderboard"),
            orderBy("rank", "asc")
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboardList = leaderboardSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
            .filter(entry => entry.tournament_id === params.slug);
        setLeaderboardData(leaderboardList);


      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [params.slug, firestore]);

  if (loading) {
    return <div className="container py-12 flex justify-center"><Loader2 className="w-16 h-16 animate-spin"/></div>;
  }

  if (!tournament) {
    return notFound();
  }
  
  const fullTournamentData = {
      ...tournament,
      description: 'Join the battle and compete for glory and a massive prize pool. Prove your skills against the best teams in the region.',
      rules: [
        'All players must adhere to fair play rules.',
        'Team rosters are locked upon registration.',
        'Check-in is required 30 minutes before match time.',
      ],
      date: format(tournament.tournament_date.toDate(), 'PPP'),
      time: tournament.tournament_time,
      prizePool: `₹${tournament.prize_pool.toLocaleString()}`,
      entryFee: tournament.entry_fee > 0 ? `₹${tournament.entry_fee}`: 'Free',
  }

  return (
    <div className="container py-12">
      <div className="mb-8 overflow-hidden rounded-xl">
        <Image
          src={tournament.banner_url || 'https://placehold.co/1200x400.png'}
          alt={tournament.title}
          width={1200}
          height={400}
          className="w-full object-cover aspect-[16/6]"
        />
      </div>
      <div className="space-y-4 mb-12 text-center">
        <p className="text-primary font-semibold">{tournament.game_name}</p>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">{tournament.title}</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">{fullTournamentData.description}</p>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-8">
          <TournamentDetails tournament={fullTournamentData} />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-8">
           {leaderboardData.length > 0 ? <TournamentLeaderboard data={leaderboardData} /> : <div className="text-center p-8 bg-card rounded-lg">Leaderboard data is not yet available for this tournament.</div>}
        </TabsContent>
        <TabsContent value="register" className="mt-8">
          <TournamentRegistration tournament={tournament} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
