import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { tournaments } from '@/lib/data';
import { Award, Calendar, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TournamentsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">All Tournaments</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
          Find your next challenge. Browse our list of active and upcoming tournaments.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0">
              <Image
                src={tournament.game.imageUrl}
                alt={tournament.game.name}
                width={400}
                height={225}
                data-ai-hint={tournament.game.aiHint}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <CardTitle className="mb-2">{tournament.title}</CardTitle>
              <CardDescription>{tournament.game.name}</CardDescription>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{tournament.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{tournament.prizePool} Prize Pool</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Entry: {tournament.entryFee}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href={`/tournaments/${tournament.slug}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
