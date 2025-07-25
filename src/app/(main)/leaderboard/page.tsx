
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type LeaderboardEntry, type Tournament, type MatchResult, type Registration } from '@/lib/types';
import TournamentLeaderboard from '../../tournaments/components/TournamentLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SLOTS = ['A', 'B', 'C', 'D', 'E'];

export default function LeaderboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string>(SLOTS[0]);
    const [loadingTournaments, setLoadingTournaments] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        if (!firestore) {
            setLoadingTournaments(false);
            return;
        };

        const fetchTournaments = async () => {
            setLoadingTournaments(true);
            const tournamentsCollection = collection(firestore, 'tournaments');
            
            const q = query(tournamentsCollection, orderBy('tournament_date', 'desc'));
            const tournamentsSnapshot = await getDocs(q);
            
            const tournamentsList = tournamentsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }) as Tournament)
                .filter(t => t.game_name === "BGMI");

            setTournaments(tournamentsList);
            if (tournamentsList.length > 0) {
                setSelectedTournament(tournamentsList[0].id);
            }
            setLoadingTournaments(false);
        };
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (!selectedTournament || !firestore) {
            setLeaderboard([]);
            return;
        }

        const fetchLeaderboard = async () => {
            setLoadingLeaderboard(true);

            // 1. Fetch all registrations for the selected tournament
             const allRegsQuery = query(
                collection(firestore, 'registrations'),
                where('tournament_id', '==', selectedTournament)
            );
            const allRegsSnapshot = await getDocs(allRegsQuery);
            const allRegistrations = allRegsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
            
            // Filter registrations for the selected slot client-side
            const slotRegistrations = allRegistrations.filter(reg => reg.slot === selectedSlot);
            const slotRegistrationIds = slotRegistrations.map(reg => reg.id);

            if (slotRegistrationIds.length === 0) {
                setLeaderboard([]);
                setLoadingLeaderboard(false);
                return;
            }

            // 2. Fetch all match results for the tournament
            const matchesQuery = query(
                collection(firestore, 'matches'),
                where('tournament_id', '==', selectedTournament)
            );
            const matchesSnapshot = await getDocs(matchesQuery);
            const allMatchesList = matchesSnapshot.docs.map(doc => doc.data() as MatchResult);

            // 3. Filter matches for the selected slot's registrations
            const slotMatchesList = allMatchesList.filter(match => slotRegistrationIds.includes(match.registration_id));

            // 4. Aggregate stats
            const teamStats = new Map<string, { squad_name: string; total_points: number; total_kills: number; matches_played: number; }>();

            slotMatchesList.forEach(match => {
                const teamId = match.registration_id;
                const existing = teamStats.get(teamId) || { squad_name: match.squad_name, total_points: 0, total_kills: 0, matches_played: 0 };
                
                existing.total_points += match.total_points;
                existing.total_kills += match.kills;
                
                // Count unique matches played for the team within this slot's matches
                const matchesPlayedForTeam = new Set(slotMatchesList.filter(m => m.registration_id === teamId).map(m => m.match_number)).size;
                existing.matches_played = matchesPlayedForTeam;
                
                teamStats.set(teamId, existing);
            });
            
            const aggregatedResults = Array.from(teamStats.entries()).map(([id, data]) => ({
                id,
                ...data,
            }));

            // Sort by total_points desc, then total_kills desc as a tiebreaker
            aggregatedResults.sort((a, b) => {
                if (b.total_points !== a.total_points) {
                    return b.total_points - a.total_points;
                }
                return b.total_kills - a.total_kills;
            });

            const finalLeaderboard = aggregatedResults.map((team, index) => ({
                id: team.id,
                tournament_id: selectedTournament,
                squad_name: team.squad_name,
                total_kills: team.total_kills,
                matches_played: team.matches_played,
                points: team.total_points,
                rank: index + 1,
            }));
            
            setLeaderboard(finalLeaderboard);
            setLoadingLeaderboard(false);
        };
        
        fetchLeaderboard();

    }, [selectedTournament, selectedSlot]);

    if (authLoading) {
        return (
             <div className="container py-12 flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    if (!user) {
         return (
            <div className="container py-12 text-center">
                 <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Leaderboards</h1>
                 <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl mt-4">
                    Please log in to view the leaderboards.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/login">Login or Sign Up</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <div className="space-y-4 mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Leaderboards</h1>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                    Check out the top-performing teams for BGMI tournaments.
                </p>
            </div>

            <div className="max-w-xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                    {loadingTournaments ? (
                        <div className="flex justify-center items-center h-10"><Loader2 className="w-6 h-6 animate-spin"/></div>
                    ): (
                        <Select value={selectedTournament} onValueChange={setSelectedTournament} disabled={tournaments.length === 0}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a tournament" />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div>
                     <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={!selectedTournament}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Slot" />
                        </SelectTrigger>
                        <SelectContent>
                            {SLOTS.map(slot => (
                                <SelectItem key={slot} value={slot}>Slot {slot}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loadingLeaderboard ? (
                <Card><CardContent className="p-6 text-center flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin mr-2"/> Loading leaderboard...</CardContent></Card>
            ) : leaderboard.length > 0 ? (
                <TournamentLeaderboard data={leaderboard} />
            ) : (
                <Card><CardContent className="p-6 text-center">No leaderboard data found for this tournament and slot yet. Results will appear here after matches are scored.</CardContent></Card>
            )}
        </div>
    );
}
