import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LeaderboardEntry {
    rank: number;
    squadName: string;
    totalKills: number;
    matchesPlayed: number;
    points: number;
}

export default function TournamentLeaderboard({ data }: { data: LeaderboardEntry[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Squad Name</TableHead>
                            <TableHead className="text-right">Total Kills</TableHead>
                            <TableHead className="text-right">Matches</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((entry) => (
                            <TableRow key={entry.rank}>
                                <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
                                <TableCell className="font-semibold">{entry.squadName}</TableCell>
                                <TableCell className="text-right">{entry.totalKills}</TableCell>
                                <TableCell className="text-right">{entry.matchesPlayed}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{entry.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
