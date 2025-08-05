
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Gamepad2, Medal, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import HowItWorks from '@/components/shared/HowItWorks';
import TournamentCarousel from '@/components/shared/TournamentCarousel';
import Section from '@/components/shared/Section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
    {
      name: "SavagePlayer47",
      prize: "Won ₹10,000",
      quote: "Winnova has the most competitive tournaments I've ever played in. The prize pools are massive and the community is fantastic!",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "gamer portrait"
    },
    {
      name: "NinjaGamerX",
      prize: "Won ₹5,000",
      quote: "The registration process is so smooth, and getting payouts is quick and easy. Highly recommend this platform for any serious gamer.",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "esports player"
    },
    {
      name: "ClasherQueen",
      prize: "Won ₹2,500",
      quote: "I won my first big tournament here! The support team was super helpful with my questions. Can't wait for the next event.",
      avatar: "https://placehold.co/100x100.png",
      aiHint: "woman gamer"
    },
];

const howItWorksSteps = [
    {
        title: "Compete",
        description: "Join daily tournaments and battle against top players to prove your skills and climb the ranks.",
        image: "/images/compete.png",
        icon: Gamepad2,
        aiHint: "esports competition"
    },
    {
        title: "Win",
        description: "Dominate the competition and secure victory. Every match is a chance to showcase your talent.",
        image: "/images/win.png",
        icon: Award,
        aiHint: "gaming trophy"
    },
    {
        title: "Rank Up",
        description: "Earn points for every win and kill. Climb the leaderboard and become a legend in the community.",
        image: "/images/rank.png",
        icon: Medal,
        aiHint: "leaderboard ranking"
    },
    {
        title: "Earn",
        description: "Claim your share of massive prize pools. Your skill translates directly into real rewards.",
        image: "/images/earn.png",
        icon: Crown,
        aiHint: "winning prize money"
    }
]

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const tournamentsCollection = collection(firestore, 'tournaments');
        const q = query(tournamentsCollection, where('status', '==', 'upcoming'));
        const tournamentsSnapshot = await getDocs(q);
        
        const tournamentsList = tournamentsSnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          } as Tournament;
        });
        tournamentsList.sort((a, b) => a.tournament_date.toMillis() - b.tournament_date.toMillis());
        setUpcomingTournaments(tournamentsList);

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
    <div className="bg-[#0d0d0d] text-white">
      <Section className="w-full py-20 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Compete. Conquer. Collect.
            </h1>
            <p className="text-lg text-muted-foreground mt-4">
              Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-[#FEBE8C] hover:bg-[#FEBE8C]/90 text-black font-bold rounded-lg px-8 py-3 h-auto text-base">
                <Link href="/tournaments">Browse Tournaments</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-[600px] h-[600px] rounded-[20px] overflow-hidden">
            <Image
                src="/images/bgmi1.png"
                alt="Winnova Hero Image"
                fill
                className="object-cover"
                data-ai-hint="gaming action shot"
            />
          </div>
        </div>
      </Section>
      
      <Section className="py-20 px-6">
          <div className="container mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
              <div className="space-y-16">
                  {howItWorksSteps.map((step, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                          <div className={`flex justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                              <Image src={step.image} alt={step.title} width={500} height={500} className="rounded-lg" data-ai-hint={step.aiHint} />
                          </div>
                          <div className={`text-center md:text-left ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                            <step.icon className="w-12 h-12 text-[#FEBE8C] mx-auto md:mx-0 mb-4"/>
                            <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                            <p className="text-lg text-muted-foreground">{step.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </Section>


      <Section className="w-full py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Tournaments</h2>
          <TournamentCarousel tournaments={upcomingTournaments} loading={loading || authLoading} />
        </div>
      </Section>

      <Section className="w-full py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Players Say</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-[#1a1a1a] border-[#2a2a2a] p-6 flex flex-col">
                <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.aiHint} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-sm text-[#FEBE8C]">{testimonial.prize}</p>
                    </div>
                </div>
                <blockquote className="text-muted-foreground italic mt-4 flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
