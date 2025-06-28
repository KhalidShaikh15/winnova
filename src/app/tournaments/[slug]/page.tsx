import TournamentDetails from '@/app/tournaments/components/TournamentDetails';
import TournamentLeaderboard from '@/app/tournaments/components/TournamentLeaderboard';
import TournamentRegistration from '@/app/tournaments/components/TournamentRegistration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tournaments, leaderboardData } from '@/lib/data';
import type { Tournament } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export async function generateStaticParams() {
  return tournaments.map((tournament) => ({
    slug: tournament.slug,
  }));
}

function getTournamentBySlug(slug: string): Tournament | undefined {
  return tournaments.find((t) => t.slug === slug);
}

export default function TournamentPage({ params }: { params: { slug: string } }) {
  const tournament = getTournamentBySlug(params.slug);

  if (!tournament) {
    notFound();
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-8">
        <div className="lg:w-1/3">
          <Image
            src={tournament.game.imageUrl}
            alt={tournament.game.name}
            width={600}
            height={400}
            data-ai-hint={tournament.game.aiHint}
            className="rounded-lg object-cover w-full aspect-video shadow-lg"
          />
        </div>
        <div className="lg:w-2/3">
          <p className="text-primary font-semibold">{tournament.game.name}</p>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline mt-1 mb-4">{tournament.title}</h1>
          <p className="text-muted-foreground text-lg">{tournament.description}</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-8">
          <TournamentDetails tournament={tournament} />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-8">
          <TournamentLeaderboard data={leaderboardData} />
        </TabsContent>
        <TabsContent value="register" className="mt-8">
          <TournamentRegistration tournament={tournament} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
