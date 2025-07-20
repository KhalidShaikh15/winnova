
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type LeaderboardEntry, type Tournament, type MatchResult, type Registration } from '@/lib/types';
import TournamentLeaderboard from '../tournaments/components/TournamentLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const SLOTS = ['A', 'B', 'C', 'D', 'E'];

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string>(SLOTS[0]);
    const [loadingTournaments, setLoadingTournaments] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        const fetchTournaments = async () => {
            if (!firestore) return;
            setLoadingTournaments(true);
            const tournamentsCollection = collection(firestore, 'tournaments');
            
            const tournamentsSnapshot = await getDocs(query(tournamentsCollection, orderBy('created_at', 'desc')));
            
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

            // 1. Fetch registrations for the selected slot
            const regsQuery = query(
                collection(firestore, 'registrations'),
                where('tournament_id', '==', selectedTournament),
                where('slot', '==', selectedSlot)
            );
            const regsSnapshot = await getDocs(regsQuery);
            const slotRegistrations = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
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

            // 3. Filter matches for the selected slot
            const slotMatchesList = allMatchesList.filter(match => slotRegistrationIds.includes(match.registration_id));

            // 4. Aggregate stats
            const teamStats = new Map<string, { squad_name: string; total_points: number; total_kills: number; matches_played: number; }>();

            slotMatchesList.forEach(match => {
                const teamId = match.registration_id;
                const existing = teamStats.get(teamId) || { squad_name: match.squad_name, total_points: 0, total_kills: 0, matches_played: 0 };
                
                existing.total_points += match.total_points;
                existing.total_kills += match.kills;
                // This logic might need refinement if matches_played should be per-slot
                const matchesPlayedForTeam = slotMatchesList.filter(m => m.registration_id === teamId).length;
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
