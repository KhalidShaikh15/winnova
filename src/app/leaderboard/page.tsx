'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type LeaderboardEntry } from '@/lib/types';
import TournamentLeaderboard from '../tournaments/components/TournamentLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Tournament } from '@/lib/types';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            const tournamentsCollection = collection(firestore, 'tournaments');
            const tournamentsSnapshot = await getDocs(tournamentsCollection);
            const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
            setTournaments(tournamentsList);
            if (tournamentsList.length > 0) {
                const defaultTournamentId = tournamentsList.find(t => t.status !== 'completed')?.id || tournamentsList[0].id;
                if (defaultTournamentId) {
                    setSelectedTournament(defaultTournamentId);
                } else {
                    setLoading(false);
                }
            } else {
                 setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (!selectedTournament) {
            setLeaderboard([]);
            return;
        };

        const fetchLeaderboard = async () => {
            setLoading(true);
            const leaderboardCollection = collection(firestore, 'leaderboard');
            const q = query(
                leaderboardCollection,
                orderBy('rank', 'asc')
            );
            const leaderboardSnapshot = await getDocs(q);
            // client-side filter as we don't have composite index
            const leaderboardList = leaderboardSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
                .filter(entry => entry.tournament_id === selectedTournament);

            setLeaderboard(leaderboardList);
            setLoading(false);
        };
        fetchLeaderboard();
    }, [selectedTournament]);

    return (
        <div className="container py-12">
            <div className="space-y-4 mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Leaderboards</h1>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                    Check out the top-performing teams across various tournaments.
                </p>
            </div>

            <div className="max-w-md mx-auto mb-8">
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a tournament" />
                    </SelectTrigger>
                    <SelectContent>
                        {tournaments.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <Card><CardContent className="p-6 text-center">Loading leaderboard...</CardContent></Card>
            ) : leaderboard.length > 0 ? (
                <TournamentLeaderboard data={leaderboard} />
            ) : (
                <Card><CardContent className="p-6 text-center">No leaderboard data found for this tournament.</CardContent></Card>
            )}
        </div>
    );
}
