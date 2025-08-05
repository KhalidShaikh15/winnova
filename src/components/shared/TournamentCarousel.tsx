
'use client';

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type Tournament } from "@/lib/types";
import Image from "next/image";
import { Award, Badge, Calendar, Group, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";

interface TournamentCarouselProps {
    tournaments: Tournament[];
    loading: boolean;
}

export default function TournamentCarousel({ tournaments, loading }: TournamentCarouselProps) {
    if (loading) {
        return <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (tournaments.length === 0) {
        return <p className="text-center text-muted-foreground">No upcoming tournaments found.</p>
    }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {tournaments.map((tournament) => (
          <CarouselItem key={tournament.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <Card className="bg-card border-border flex flex-col h-full">
                <CardHeader>
                  <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={tournament.banner_url || 'https://placehold.co/400x200.png'}
                      alt={tournament.title}
                      fill
                      className="object-cover"
                      data-ai-hint="tournament banner"
                    />
                  </div>
                  <CardTitle>{tournament.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{tournament.game_name}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm flex-grow">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary"/>
                        <span>₹{tournament.prize_pool.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary"/>
                        <span>Fee: ₹{tournament.entry_fee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary"/>
                        <span>{format(tournament.tournament_date.toDate(), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Group className="w-4 h-4 text-primary"/>
                        <span>{tournament.match_type}</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-foreground bg-background border-border hover:bg-accent"/>
      <CarouselNext className="text-foreground bg-background border-border hover:bg-accent"/>
    </Carousel>
  )
}
