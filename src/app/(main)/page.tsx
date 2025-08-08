
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Gamepad2, Medal, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import TournamentCarousel from '@/components/shared/TournamentCarousel';
import Section from '@/components/shared/Section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from 'framer-motion';

const heroSlides = [
    {
        slogan: "Compete. Conquer. Collect.",
        subtext: "Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.",
        image: "/images/bgmi2.png",
        alt: "Gaming action shot",
        dataAiHint: "gaming action shot"
    },
    {
        slogan: "Battle with Skill. Rise with Glory.",
        subtext: "Prove your mettle in intense matches. Every victory brings you closer to the top of the leaderboards.",
        image: "/images/bgmi0.png",
        alt: "Intense gaming battle",
        dataAiHint: "intense gaming battle"
    },
    {
        slogan: "Play Bold. Win Big. Be Legendary.",
        subtext: "Step into the arena where legends are born. Claim massive prizes and write your name in Winnova history.",
        image: "/images/bgmi1.png",
        alt: "Legendary gaming moment",
        dataAiHint: "legendary gaming moment"
    }
];

const testimonials = [
    {
      name: "SavagePlayer47",
      quote: "Winnova has the most competitive tournaments I've ever played in. The prize pools are massive and the community is fantastic!",
    },
    {
      name: "NinjaGamerX",
      quote: "The registration process is so smooth, and getting payouts is quick and easy. Highly recommend this platform for any serious gamer.",
    },
    {
      name: "ClasherQueen",
      quote: "I won my first big tournament here! The support team was super helpful with my questions. Can't wait for the next event.",
    },
    {
        name: "MaxPower",
        quote: "The variety of games is great. Always something new to compete in. The leaderboards are a great touch!",
    },
    {
        name: "Luna",
        quote: "Fair play is taken seriously here, which I appreciate. The admins are responsive and the matches start on time.",
    },
    {
        name: "Ghost",
        quote: "A fantastic platform for both casual and pro players. The UI is clean and it's easy to find everything you need.",
    }
];

const howItWorksSteps = [
    {
        title: "Compete",
        description: "Join daily tournaments and battle against top players to prove your skills and climb the ranks.",
        icon: Gamepad2,
    },
    {
        title: "Win",
        description: "Dominate the competition and secure victory. Every match is a chance to showcase your talent.",
        icon: Award,
    },
    {
        title: "Rank Up",
        description: "Earn points for every win and kill. Climb the leaderboard and become a legend in the community.",
        icon: Medal,
    },
    {
        title: "Earn",
        description: "Claim your share of massive prize pools. Your skill translates directly into real rewards.",
        icon: Crown,
    }
]

const slideVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: '0%', opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
        setCurrentSlide(prevSlide => (prevSlide + 1) % heroSlides.length);
    }, 4000); // 4 seconds

    return () => clearInterval(slideInterval);
  }, []);


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
    <div className="bg-background text-foreground">
      <section className="w-full py-12">
        <div className="container">
          <div className="bg-card/30 rounded-2xl p-8 md:p-12 min-h-[500px] flex items-center overflow-hidden">
            <div className="relative w-full h-full">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentSlide}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
                        {heroSlides[currentSlide].slogan}
                      </h1>
                      <p className="text-lg text-muted-foreground mt-4 max-w-md">
                        {heroSlides[currentSlide].subtext}
                      </p>
                      <div className="mt-8">
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-8 py-3 h-auto text-base">
                          <Link href="/tournaments">Browse Tournaments</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="w-full max-w-[600px] h-auto rounded-2xl shadow-2xl shadow-primary/20">
                            <Image
                                src={heroSlides[currentSlide].image}
                                alt={heroSlides[currentSlide].alt}
                                width={600}
                                height={600}
                                className="rounded-2xl w-full h-auto"
                                data-ai-hint={heroSlides[currentSlide].dataAiHint}
                                priority={currentSlide === 0}
                            />
                        </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container my-12">
          <Separator />
      </div>

      <Section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="bg-card/50 shadow-lg rounded-xl hover:shadow-primary/20 transition-shadow duration-300">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="p-4 bg-primary/20 text-primary rounded-full mb-4 inline-block">
                    <step.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
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
           <Carousel
            plugins={[autoplayPlugin.current]}
            opts={{ align: "start", loop: true }}
            className="w-full"
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
          >
            <CarouselContent>
                {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                    <Card className="bg-card border-border p-6 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-primary/80 text-primary-foreground font-bold text-lg">
                                {testimonial.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{testimonial.name}</p>
                            </div>
                        </div>
                        <blockquote className="text-muted-foreground italic flex-grow">
                            &ldquo;{testimonial.quote}&rdquo;
                        </blockquote>
                    </Card>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
      </Section>
    </div>
  );
}
