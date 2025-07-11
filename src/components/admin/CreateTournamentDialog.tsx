'use client';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { Game } from "@/lib/types"

const tournamentFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  game_name: z.string({ required_error: "Please select a game." }),
  entry_fee: z.coerce.number().min(0),
  prize_pool: z.coerce.number().min(0),
  match_type: z.enum(["Solo", "Duo", "Squad"]),
  tournament_date: z.date({ required_error: "A date is required." }),
  max_teams: z.coerce.number().int().min(2),
  status: z.enum(["upcoming", "ongoing", "completed"]),
})

type TournamentFormValues = z.infer<typeof tournamentFormSchema>

interface CreateTournamentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    games: Game[];
    onTournamentCreated: () => void;
}

export default function CreateTournamentDialog({ isOpen, setIsOpen, games, onTournamentCreated }: CreateTournamentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
        title: "",
        entry_fee: 0,
        prize_pool: 0,
        match_type: "Squad",
        max_teams: 16,
        status: "upcoming",
    },
  });

  async function onSubmit(data: TournamentFormValues) {
    setLoading(true);
    try {
      const tournamentData = {
        ...data,
        tournament_date: Timestamp.fromDate(data.tournament_date),
        created_at: Timestamp.now(),
      };
      await addDoc(collection(firestore, "tournaments"), tournamentData);
      toast({ title: "Success", description: "Tournament created successfully." });
      onTournamentCreated();
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create tournament." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Showdown Series" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="game_name" render={({ field }) => (
                <FormItem><FormLabel>Game</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a game" /></SelectTrigger></FormControl>
                    <SelectContent>{games.map(game => <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="match_type" render={({ field }) => (
                <FormItem><FormLabel>Match Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Duo">Duo</SelectItem>
                      <SelectItem value="Squad">Squad</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="entry_fee" render={({ field }) => (
                    <FormItem><FormLabel>Entry Fee (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="prize_pool" render={({ field }) => (
                    <FormItem><FormLabel>Prize Pool (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            <FormField control={form.control} name="tournament_date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Tournament Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                    </Popover><FormMessage />
                </FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="max_teams" render={({ field }) => (
                    <FormItem><FormLabel>Max Teams</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select><FormMessage />
                    </FormItem>
                )} />
            </div>

            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Tournament'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
