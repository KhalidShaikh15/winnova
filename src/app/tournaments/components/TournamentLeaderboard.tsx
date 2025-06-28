import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LeaderboardEntry } from "@/lib/types";

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
                            <TableRow key={entry.id || entry.rank}>
                                <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
                                <TableCell className="font-semibold">{entry.squad_name}</TableCell>
                                <TableCell className="text-right">{entry.total_kills}</TableCell>
                                <TableCell className="text-right">{entry.matches_played}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{entry.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
