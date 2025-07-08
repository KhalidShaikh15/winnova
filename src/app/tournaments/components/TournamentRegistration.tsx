'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Tournament } from "@/lib/types"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { Award, Calendar, Gamepad2, Group, Loader2, QrCode, Send, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

// Base schema for common fields
const baseSchema = z.object({
    squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
    contact_number: z.string().min(10, "A valid contact number is required."),
    user_upi_id: z.string().min(3, "Please enter the UPI ID you used for payment."),
});

// Schema for BGMI/Free Fire
const shooterGameSchema = baseSchema.extend({
    player1_bgmi_id: z.string().min(2, `Player 1 ID is required.`),
    player2_bgmi_id: z.string().min(2, `Player 2 ID is required.`),
    player3_bgmi_id: z.string().min(2, `Player 3 ID is required.`),
    player4_bgmi_id: z.string().min(2, `Player 4 ID is required.`),
});

// Schema for Clash of Clans
const strategyGameSchema = baseSchema.extend({
    clan_tag: z.string().min(2, "Clan Tag is required."),
});


export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUpiId, setSubmittedUpiId] = useState("");

  const registrationSchema = useMemo(() => {
    if (tournament.game_name === "Clash of Clans") {
        return strategyGameSchema;
    }
    return shooterGameSchema;
  }, [tournament.game_name]);
  
  type RegistrationFormValues = z.infer<typeof registrationSchema>;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
        squad_name: "",
        contact_number: "",
        user_upi_id: "",
        ...(tournament.game_name === "Clash of Clans" 
            ? { clan_tag: "" } 
            : { 
                player1_bgmi_id: "",
                player2_bgmi_id: "",
                player3_bgmi_id: "",
                player4_bgmi_id: "",
              }
        ),
    },
  });

  async function onSubmit(values: RegistrationFormValues) {
    if (!firestore) return;
    setLoading(true);

    if (!user || !user.email) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to register for a tournament.",
        });
        setLoading(false);
        return;
    }
    
    try {
      const docData = {
        ...values,
        user_id: user.uid,
        username: user.displayName || user.email || 'Anonymous',
        user_email: user.email,
        tournament_id: tournament.id,
        tournament_title: tournament.title,
        game_name: tournament.game_name,
        status: 'pending' as const,
        created_at: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, 'registrations'), docData);

      toast({
        title: "Registration Submitted!",
        description: "Your team registration has been submitted for review.",
      });
      setSubmittedUpiId(values.user_upi_id);
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Registration submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      toast({
        variant: 'destructive',
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleContactOrganizer = () => {
    if (!submittedUpiId) return;
    const message = `Hey, I have registered for ${tournament.title} with UPI ID ${submittedUpiId}`;
    const whatsappUrl = `https://wa.me/919653134660?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  if (authLoading) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
            <CardContent><div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div></CardContent>
        </Card>
    )
  }

  if (!user) {
      return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Please Log In</CardTitle>
                <CardDescription>You must be logged in to register for this tournament.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/login">Login or Sign Up</Link>
                </Button>
            </CardContent>
        </Card>
      )
  }

  if (isSubmitted) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Registration Successful!</CardTitle>
            <CardDescription>
              Your registration has been submitted! You will be notified once it is confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
              <Button size="lg" onClick={handleContactOrganizer}>
                  <Send className="mr-2 h-4 w-4"/>
                  Contact on WhatsApp
              </Button>
              <p className="text-sm text-muted-foreground mt-4">Click the button to confirm your slot with the organizer.</p>
          </CardContent>
        </Card>
      );
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {tournament.title}</CardTitle>
        <CardDescription>
            Fill out the form below to enter your team and join the battle!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
            <h3 className="font-bold mb-4">Tournament Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary"/><span>{tournament.game_name}</span></div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary"/><span>Prize: ₹{tournament.prize_pool.toLocaleString()}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/><span>{format(tournament.tournament_date.toDate(), 'PPP')}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary"/><span>{tournament.tournament_time}</span></div>
                <div className="flex items-center gap-2"><Group className="w-4 h-4 text-primary"/><span>{tournament.match_type}</span></div>
                <div className="flex items-center gap-2 text-primary font-semibold">Fee: ₹{tournament.entry_fee}</div>
            </div>
        </div>

        {tournament.entry_fee > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-center gap-4 border">
              {tournament.qr_link ? 
                <div className="flex-shrink-0">
                    <Image src={tournament.qr_link} alt="Scan to Pay Entry Fee" width={150} height={150} className="rounded-md" />
                </div>
              :
                <div className="flex-shrink-0 flex items-center justify-center w-[150px] h-[150px] bg-background rounded-md">
                    <p className="text-sm text-muted-foreground text-center">QR Code not available.</p>
                </div>
              }
              <div className="space-y-2 text-center sm:text-left">
                  <p className="font-semibold text-lg">Entry Fee: <span className="text-primary">₹{tournament.entry_fee}</span></p>
                  <p className="text-sm text-muted-foreground">Scan the QR or pay directly to the UPI ID below:</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 p-2 bg-background rounded-md">
                     <QrCode className="w-5 h-5 text-primary" />
                     <span className="font-mono text-primary font-bold">{tournament.upi_id || 'battlebuck@kotak'}</span>
                  </div>
                   <p className="text-xs text-muted-foreground pt-1">Organizer: {tournament.organizer_name}</p>
              </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="squad_name" render={({ field }) => (
              <FormItem><FormLabel>Squad Name</FormLabel><FormControl><Input placeholder="Enter your squad name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="contact_number" render={({ field }) => (
              <FormItem><FormLabel>Contact Number (WhatsApp)</FormLabel><FormControl><Input type="tel" placeholder="Enter a contact number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {tournament.game_name === 'Clash of Clans' ? (
                <FormField control={form.control} name="clan_tag" render={({ field }) => (
                    <FormItem><FormLabel>Clan Tag</FormLabel><FormControl><Input placeholder="Enter your clan tag" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Player In-Game IDs</h3>
                    <FormField control={form.control} name="player1_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 1 ID</FormLabel><FormControl><Input placeholder="Enter Player 1 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="player2_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 2 ID</FormLabel><FormControl><Input placeholder="Enter Player 2 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="player3_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 3 ID</FormLabel><FormControl><Input placeholder="Enter Player 3 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="player4_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 4 ID</FormLabel><FormControl><Input placeholder="Enter Player 4 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
            )}
            
            {tournament.entry_fee > 0 && (
              <FormField control={form.control} name="user_upi_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your UPI ID (used for payment)</FormLabel>
                  <FormControl><Input placeholder="Enter the UPI ID you paid from" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {loading ? 'Submitting...' : 'Register Team'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
