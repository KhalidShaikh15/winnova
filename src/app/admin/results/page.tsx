
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Tournament, type Registration, type MatchResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getPlacementPoints = (placement: number): number => {
    if (placement === 1) return 15;
    if (placement === 2) return 12;
    if (placement === 3) return 10;
    if (placement === 4) return 8;
    if (placement === 5) return 6;
    if (placement === 6) return 4;
    if (placement === 7) return 2;
    if (placement >= 8 && placement <= 12) return 1;
    return 0;
};

export default function AdminResultsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [matchNumber, setMatchNumber] = useState(1);
    const [results, setResults] = useState<Map<string, { placement: string, kills: string }>>(new Map());
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTournaments = async () => {
            if (!firestore) return;
            setLoading(true);
            const tournamentsCollection = collection(firestore, 'tournaments');
            const q = query(tournamentsCollection, where('game_name', '==', 'BGMI'));
            const tournamentsSnapshot = await getDocs(q);
            const tournamentsList = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
            setTournaments(tournamentsList);
            setLoading(false);
        };
        fetchTournaments();
    }, []);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!selectedTournament || !firestore) {
                setRegistrations([]);
                return;
            };
            setLoading(true);
            const regsQuery = query(collection(firestore, 'registrations'), where('tournament_id', '==', selectedTournament), where('status', '==', 'confirmed'));
            const regsSnapshot = await getDocs(regsQuery);
            const regsList = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
            setRegistrations(regsList);
            // Reset results when tournament changes
            setResults(new Map(regsList.map(reg => [reg.id, { placement: '', kills: '' }])));
            setLoading(false);
        };
        fetchRegistrations();
    }, [selectedTournament]);

    const handleResultChange = (regId: string, field: 'placement' | 'kills', value: string) => {
        setResults(prev => {
            const newResults = new Map(prev);
            const current = newResults.get(regId) || { placement: '', kills: '' };
            newResults.set(regId, { ...current, [field]: value });
            return newResults;
        });
    };

    const handleSubmitResults = async () => {
        if (!selectedTournament || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a tournament.' });
            return;
        }
        setIsSubmitting(true);
        const batch = writeBatch(firestore);

        try {
            for (const [regId, result] of results.entries()) {
                const placement = parseInt(result.placement, 10);
                const kills = parseInt(result.kills, 10);

                if (isNaN(placement) || isNaN(kills)) {
                    // Skip entries that are not filled out
                    continue;
                }

                const reg = registrations.find(r => r.id === regId);
                if (!reg) continue;

                const placement_points = getPlacementPoints(placement);
                const kill_points = kills;
                const total_points = placement_points + kill_points;

                const matchResult: Omit<MatchResult, 'id'> = {
                    match_id: uuidv4(),
                    tournament_id: selectedTournament,
                    registration_id: reg.id,
                    squad_name: reg.squad_name,
                    match_number,
                    placement,
                    kills,
                    placement_points,
                    kill_points,
                    total_points,
                    created_at: new Date(),
                };
                
                const matchDocRef = doc(collection(firestore, 'matches'));
                batch.set(matchDocRef, matchResult);
            }

            await batch.commit();
            toast({ title: 'Success', description: `Results for Match #${matchNumber} saved.` });
            setResults(new Map(registrations.map(reg => [reg.id, { placement: '', kills: '' }])));
            setMatchNumber(prev => prev + 1);
        } catch (error) {
            console.error("Error submitting results:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save results.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Results Management (BGMI)</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Enter Match Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a BGMI Tournament" />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Match Number"
                            value={matchNumber}
                            onChange={(e) => setMatchNumber(parseInt(e.target.value, 10) || 1)}
                            min="1"
                        />
                    </div>
                    {loading && !selectedTournament && <p>Select a tournament to get started.</p>}
                </CardContent>
            </Card>

            {selectedTournament && (
                <Card>
                    <CardHeader>
                        <CardTitle>Teams for &quot;{tournaments.find(t=>t.id === selectedTournament)?.title}&quot; - Match #{matchNumber}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Squad Name</TableHead>
                                            <TableHead>Placement (1-20)</TableHead>
                                            <TableHead>Kills</TableHead>
                                            <TableHead>Points</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations.map(reg => {
                                            const result = results.get(reg.id) || { placement: '', kills: '' };
                                            const placement = parseInt(result.placement, 10);
                                            const kills = parseInt(result.kills, 10);
                                            const placementPoints = isNaN(placement) ? 0 : getPlacementPoints(placement);
                                            const totalPoints = placementPoints + (isNaN(kills) ? 0 : kills);

                                            return (
                                                <TableRow key={reg.id}>
                                                    <TableCell className="font-medium">{reg.squad_name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={result.placement}
                                                            onChange={(e) => handleResultChange(reg.id, 'placement', e.target.value)}
                                                            className="w-24"
                                                            min="1"
                                                            max="20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={result.kills}
                                                            onChange={(e) => handleResultChange(reg.id, 'kills', e.target.value)}
                                                            className="w-24"
                                                            min="0"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-bold">{totalPoints}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                                <Button onClick={handleSubmitResults} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : 'Save Match Results'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
