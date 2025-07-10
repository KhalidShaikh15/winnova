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
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { addDoc, collection, doc, Timestamp, updateDoc } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import type { Game, Tournament } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

const tournamentFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  game_name: z.string({ required_error: "Please select a game." }),
  banner_url: z.string().min(1, { message: "Please select a banner image." }),
  entry_fee: z.coerce.number().min(0),
  prize_pool: z.coerce.number().min(0),
  match_type: z.enum(["Solo", "Duo", "Squad"]),
  tournament_date: z.date({ required_error: "A date is required." }),
  tournament_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)."),
  max_teams: z.coerce.number().int().min(2),
  status: z.enum(["upcoming", "ongoing", "completed"]),
  organizer_name: z.string().min(3, "Organizer name is required."),
  allow_whatsapp: z.boolean().default(false),
  whatsapp_number: z.string().optional(),
}).refine(data => {
    if (data.allow_whatsapp) {
        return !!data.whatsapp_number && data.whatsapp_number.length >= 10;
    }
    return true;
}, {
    message: "A valid WhatsApp number is required when enabled.",
    path: ["whatsapp_number"],
});


type TournamentFormValues = z.infer<typeof tournamentFormSchema>

interface CreateTournamentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    games: Game[];
    onFormSubmit: () => void;
    tournamentData?: Tournament | null;
}

const bannerOptions = [
    'https://i.ibb.co/7NRRQntC/bgmi2-150.png',
    'https://i.ibb.co/RGbVtrXb/bgmi3-150.png',
    'https://i.ibb.co/G3PHSJ3q/coc2-150.png',
    'https://i.ibb.co/FkP4tj3H/coc3-150.png',
];

export default function CreateTournamentDialog({ isOpen, setIsOpen, games, onFormSubmit, tournamentData }: CreateTournamentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!tournamentData;

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
        title: "",
        entry_fee: 0,
        prize_pool: 0,
        match_type: "Squad",
        max_teams: 16,
        status: "upcoming",
        tournament_time: "18:00",
        organizer_name: "Khalid Shaikh",
        allow_whatsapp: true,
        whatsapp_number: "9653134660",
        banner_url: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && tournamentData) {
        form.reset({
          ...tournamentData,
          tournament_date: tournamentData.tournament_date.toDate(),
        });
      } else {
        form.reset({
            title: "",
            game_name: undefined,
            entry_fee: 0,
            prize_pool: 0,
            match_type: "Squad",
            tournament_date: new Date(),
            tournament_time: "18:00",
            max_teams: 16,
            status: "upcoming",
            organizer_name: "Khalid Shaikh",
            allow_whatsapp: true,
            whatsapp_number: "9653134660",
            banner_url: "",
        });
      }
    }
  }, [isOpen, isEditMode, tournamentData, form]);


  const allowWhatsappValue = form.watch("allow_whatsapp");
  const selectedBanner = form.watch("banner_url");

  async function onSubmit(data: TournamentFormValues) {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firebase is not configured correctly." });
        return;
    }
    
    setLoading(true);
    try {
      const payload: Omit<Tournament, 'id' | 'created_at'> & { upi_id: string; tournament_date: Timestamp } = {
        ...data,
        tournament_date: Timestamp.fromDate(data.tournament_date),
        upi_id: '9653134660@kotak811',
      };
      
      if (isEditMode && tournamentData) {
        const tournamentDocRef = doc(firestore, 'tournaments', tournamentData.id);
        await updateDoc(tournamentDocRef, payload);
        toast({ title: "Success", description: "Tournament updated successfully." });
      } else {
        await addDoc(collection(firestore, "tournaments"), { ...payload, created_at: Timestamp.now() });
        toast({ title: "Success", description: "Tournament created successfully." });
      }
      
      onFormSubmit();
      setIsOpen(false);
    } catch (error: any) {
      let description = "An unknown error occurred. Please check your Firebase settings and security rules.";
      if (error instanceof Error) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: isEditMode ? "Update Failed" : "Creation Failed",
        description: description,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Showdown Series" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

             <FormField
              control={form.control}
              name="banner_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Banner</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {bannerOptions.map((banner) => (
                        <div
                          key={banner}
                          className={cn(
                            "relative w-[150px] h-[100px] cursor-pointer rounded-lg border-2 border-transparent transition-all",
                            selectedBanner === banner && "border-primary ring-2 ring-primary"
                          )}
                          onClick={() => field.onChange(banner)}
                        >
                          <Image
                            src={banner}
                            alt={`Banner option ${bannerOptions.indexOf(banner) + 1}`}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>Select a banner for the tournament.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="game_name" render={({ field }) => (
                <FormItem><FormLabel>Game</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a game" /></SelectTrigger></FormControl>
                    <SelectContent>{games.map(game => <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="match_type" render={({ field }) => (
                <FormItem><FormLabel>Match Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="grid grid-cols-2 gap-4">
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
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover><FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="tournament_time" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Time (24h format)</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="max_teams" render={({ field }) => (
                    <FormItem><FormLabel>Max Teams</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            
            <FormField control={form.control} name="organizer_name" render={({ field }) => (
                <FormItem><FormLabel>Organizer Name</FormLabel><FormControl><Input placeholder="e.g. Winnova" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="allow_whatsapp" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Enable WhatsApp Contact</FormLabel>
                        <FormDescription>Allow users to contact you on WhatsApp after registration.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
            )} />

            {allowWhatsappValue && (
                <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input placeholder="e.g. 919876543210" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            )}

            <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}{loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Tournament' : 'Create Tournament')}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
