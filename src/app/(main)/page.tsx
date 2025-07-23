
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Group, Users, Star, Loader2, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Game } from '@/lib/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Map game names to local image paths
  const gameImageMap: { [key: string]: string } = {
    'BGMI': '/images/feature bgmi.png',
    'Clash of Clans': '/images/feature coc.png',
    'Free Fire': '/images/feature ff.png',
    'FC25': '/images/fc feature.png',
  };
  
  const gameAltTextMap: { [key: string]: string } = {
    'BGMI': 'Feature image for BGMI',
    'Clash of Clans': 'Feature image for Clash of Clans',
    'Free Fire': 'Feature image for Free Fire',
    'FC25': 'Feature image for FC25',
  };

  const testimonials = [
    {
      name: "SavagePlayer47",
      quote: "Arena Clash has the most competitive tournaments I've ever played in. The prize pools are massive and the community is fantastic!",
      avatar: "https://placehold.co/100x100.png",
    },
    {
      name: "NinjaGamerX",
      quote: "The registration process is so smooth, and getting payouts is quick and easy. Highly recommend this platform for any serious gamer.",
      avatar: "https://placehold.co/100x100.png",
    },
    {
      name: "ClasherQueen",
      quote: "I won my first big tournament here! The support team was super helpful with my questions. Can't wait for the next event.",
      avatar: "https://placehold.co/100x100.png",
    },
  ];


  useEffect(() => {
    const fetchData = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch Games
        const gamesCollection = collection(firestore, 'games');
        const gamesSnapshot = await getDocs(gamesCollection);
        const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Game[];

        // Add FC25 if it's not already in the list
        if (!gamesList.some(game => game.name === 'FC25')) {
          gamesList.push({
            id: 'fc25',
            name: 'FC25',
            max_players: 0,
            platform: '',
            active: true,
            imageUrl: '',
            aiHint: '',
          });
        }
        setFeaturedGames(gamesList);

        // Fetch Upcoming Tournaments
        const tournamentsCollection = collection(firestore, 'tournaments');
        const q = query(tournamentsCollection, where('status', '==', 'upcoming'));
        const tournamentsSnapshot = await getDocs(q);
        
        const tournamentsList = tournamentsSnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          } as Tournament;
        });

        // Sort by date and take the first 3
        tournamentsList.sort((a, b) => a.tournament_date.toMillis() - b.tournament_date.toMillis());
        setUpcomingTournaments(tournamentsList.slice(0, 3));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
        fetchData();
    }

  }, [authLoading]);

  return (
    <>
      {/* Hero Section 1: Text Left, Image Right */}
      <section className="w-full bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-10 px-10 py-20">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-headline text-foreground">
              Compete. Conquer. Collect.
            </h1>
            <p className="text-lg text-muted-foreground mt-4">
              Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold rounded-lg px-6 py-3 h-auto">
                <Link href="/tournaments">Browse Tournaments</Link>
              </Button>
            </div>
          </div>
          {/* Right Column - Image */}
          <div className="relative w-full max-w-[600px] rounded-[20px] overflow-hidden bg-card/10">
            <Image
                src="/images/bgmi1.png"
                alt="Arena Clash Hero Image"
                width={600}
                height={600}
                className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>
      
      {/* Hero Section 2: Image Left, Text Right */}
      <section className="w-full bg-background">
        <div className="container flex flex-col-reverse md:flex-row items-center justify-between gap-10 px-10 py-20">
           {/* Left Column - Image */}
          <div className="relative w-full max-w-[600px] rounded-[20px] overflow-hidden">
              <Image
                  src="/images/bgmi0.png"
                  alt="Play Bold Hero Image"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
              />
          </div>
          {/* Right Column - Text Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-headline text-foreground">
              Play Bold. Rise Higher.
            </h1>
            <p className="text-lg text-muted-foreground mt-4">
             Where legends are born and battles define destiny. Join the elite players and make your mark in history.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold rounded-lg px-6 py-3 h-auto">
                <Link href="/tournaments">Join the Action</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="w-full py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Games</h2>
           {(authLoading || loading) ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredGames.map((game) => (
                <Link key={game.id} href={`/games/${game.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-xl h-full rounded-xl">
                    <Image
                      src={gameImageMap[game.name] || game.imageUrl || 'https://placehold.co/400x300.png'}
                      alt={gameAltTextMap[game.name] || game.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold">{game.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Tournaments Section */}
      <section className="w-full py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Upcoming Tournaments</h2>
           {(authLoading || loading) ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : !user ? (
            <p className="text-center text-muted-foreground">Please <Link href="/login" className="underline font-semibold">log in</Link> to see upcoming tournaments.</p>
          ) : upcomingTournaments.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming tournaments found.</p>
          ) : (
            <div className="space-y-8">
              {upcomingTournaments.map((tournament) => (
                <Card key={tournament.id} className="w-full transition-all hover:shadow-md">
                  <Link href={`/tournaments/${tournament.id}`}>
                    <div className="grid grid-cols-1 md:grid-cols-5 items-center p-4 gap-4">
                        <div className="md:col-span-1">
                            <Image src={tournament.banner_url || 'https://placehold.co/150x100.png'} alt={tournament.title} width={150} height={100} className="rounded-lg object-cover w-full h-auto aspect-video"/>
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
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 bg-card/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">What Our Players Say</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 flex flex-col">
                <div className="flex-grow">
                  <blockquote className="text-muted-foreground italic mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <Avatar>
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <div className="flex items-center gap-0.5 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
