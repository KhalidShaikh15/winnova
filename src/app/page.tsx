'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { keyStats } from '@/lib/data';
import { Award, Calendar, Gamepad2, Group, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game } from '@/lib/types';
import { format } from 'date-fns';

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Games
        const gamesCollection = collection(firestore, 'games');
        const gamesSnapshot = await getDocs(gamesCollection);
        const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Game[];
        setFeaturedGames(gamesList);

        // Fetch Upcoming Tournaments
        const tournamentsCollection = collection(firestore, 'tournaments');
        const q = query(tournamentsCollection, where('status', '==', 'upcoming'));
        const tournamentsSnapshot = await getDocs(q);
        
        const tournamentsList = tournamentsSnapshot.docs.map(doc => {
          const data = doc.data() as Tournament;
          const game = gamesList.find(g => g.name === data.game_name);
          return {
            id: doc.id,
            ...data,
            gameImage: game?.imageUrl || 'https://placehold.co/150x100.png',
            gameAiHint: game?.aiHint || 'gaming',
          };
        }) as Tournament[];

        // Sort by date and take the first 3
        tournamentsList.sort((a, b) => a.tournament_date.toMillis() - b.tournament_date.toMillis());
        setUpcomingTournaments(tournamentsList.slice(0, 3));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-card/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Welcome to Arena Clash
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The ultimate platform for competitive gaming tournaments. Join now and prove your skills.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/tournaments">Browse Tournaments</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/images/bgmi1.png"
                width="600" // Specify width as needed
                height="400"
                alt="Hero"
                data-ai-hint="gaming esports"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Key Stats Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {keyStats.map((stat) => (
                <Card key={stat.label} className="text-center transition-transform hover:scale-105 hover:shadow-lg">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {stat.label === 'Matches Conducted' && <Gamepad2 className="h-6 w-6" />}
                      {stat.label === 'Prize Money Distributed' && <Trophy className="h-6 w-6" />}
                      {stat.label === 'Registered Teams' && <Users className="h-6 w-6" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="w-full py-12 md:py-24 bg-card/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Games</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredGames.map((game) => (
                <Card key={game.name} className="overflow-hidden transition-shadow hover:shadow-xl">
                  <Image
                    src={game.imageUrl || 'https://placehold.co/400x300.png'}
                    alt={game.name}
                    width={400}
                    height={300}
                    data-ai-hint={game.aiHint || 'gaming'}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold">{game.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">Upcoming Tournaments</h2>
            <div className="space-y-8">
              {loading ? <p className="text-center">Loading tournaments...</p> : 
              upcomingTournaments.map((tournament) => (
                <Card key={tournament.id} className="w-full transition-all hover:shadow-md">
                   <Link href={`/tournaments/${tournament.id}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 items-center p-4 gap-4">
                        <div className="md:col-span-1">
                             <Image src={tournament.gameImage!} alt={tournament.game_name} width={150} height={100} data-ai-hint={tournament.gameAiHint} className="rounded-lg object-cover w-full h-auto aspect-video"/>
                        </div>
                        <div className="md:col-span-2">
                            <CardTitle>{tournament.title}</CardTitle>
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
          </div>
        </section>
      </main>
    </div>
  );
}
