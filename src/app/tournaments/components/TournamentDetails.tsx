import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Calendar, CheckSquare, Group, Users, Clock } from "lucide-react"

// A simplified tournament type for props to avoid passing complex objects
export interface TournamentDetailsProps {
    tournament: {
        date: string;
        time: string;
        prizePool: string;
        entryFee: string;
        matchType: 'Solo' | 'Duo' | 'Squad';
        rules: string[];
    }
}

export default function TournamentDetails({ tournament }: TournamentDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tournament Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">Date</p>
                            <p className="text-muted-foreground">{tournament.date}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">Time</p>
                            <p className="text-muted-foreground">{tournament.time}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">Prize Pool</p>
                            <p className="text-muted-foreground">{tournament.prizePool}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">Entry Fee</p>
                            <p className="text-muted-foreground">{tournament.entryFee}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Group className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold">Match Type</p>
                            <p className="text-muted-foreground">{tournament.matchType}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><CheckSquare className="w-6 h-6 text-primary"/> Rules</h3>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                       {tournament.rules.map((rule, index) => (
                           <li key={index}>{rule}</li>
                       ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
