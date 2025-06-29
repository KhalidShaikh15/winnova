'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Tournament } from "@/lib/types"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { Loader2, QrCode, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"

const ORGANIZER_UPI_ID = "organizer-upi@bank";
const ORGANIZER_WHATSAPP = "+919653134660";
const QR_CODE_URL = "https://placehold.co/200x200.png";

const createSchema = (matchType: 'Solo' | 'Duo' | 'Squad') => {
  let schema = z.object({
    squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
    contact_number: z.string().min(10, "A valid contact number is required."),
    user_upi_id: z.string().min(3, "Please enter the UPI ID you used for payment."),
  });

  const playerFields: Record<string, any> = {};
  const numPlayers = matchType === 'Solo' ? 1 : matchType === 'Duo' ? 2 : 4;
  for (let i = 1; i <= numPlayers; i++) {
    playerFields[`player${i}_id`] = z.string().min(2, `Player ${i} ID is required.`);
  }

  return schema.extend(playerFields);
};

type RegistrationFormValues = z.infer<ReturnType<typeof createSchema>>;

export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormValues | null>(null);
  
  const registrationSchema = createSchema(tournament.match_type);
  const numPlayers = tournament.match_type === 'Solo' ? 1 : tournament.match_type === 'Duo' ? 2 : 4;

  const defaultValues: Record<string, any> = {
    squad_name: "",
    contact_number: "",
    user_upi_id: "",
  };
  for (let i = 1; i <= numPlayers; i++) {
    defaultValues[`player${i}_id`] = '';
  }

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
  });
  
  async function onSubmit(values: RegistrationFormValues) {
    setLoading(true);

    if (!user) {
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
        tournament_id: tournament.id,
        game_name: tournament.game_name,
        status: 'pending' as const,
        created_at: serverTimestamp(),
        match_slot: 'TBD',
      };
      
      await addDoc(collection(firestore, 'registrations'), docData);

      toast({
        title: "Registration Submitted!",
        description: "Your team has been registered. Please contact the organizer to confirm.",
      });
      setSubmittedData(values);
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
    if (!submittedData) return;
    const message = `Hey, I just registered for the ${tournament.game_name} tournament with squad '${submittedData.squad_name}' using UPI ID: ${submittedData.user_upi_id}. Please confirm my slot.`;
    const whatsappUrl = `https://wa.me/${ORGANIZER_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const renderPlayerFields = () => {
    return Array.from({ length: numPlayers }, (_, i) => i + 1).map(num => (
      <FormField key={num} control={form.control} name={`player${num}_id` as any} render={({ field }) => ( 
        <FormItem>
          <FormLabel>Player {num} In-Game ID</FormLabel>
          <FormControl><Input placeholder={`Enter Player ${num} ID`} {...field} /></FormControl>
          <FormMessage />
        </FormItem> 
      )} />
    ));
  }

  if (authLoading) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </CardContent>
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
        <CardHeader>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>Your registration has been submitted. Click the button below to contact the organizer on WhatsApp and confirm your slot.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button size="lg" onClick={handleContactOrganizer}>
                <Send className="mr-2"/>
                Contact Organizer on WhatsApp
            </Button>
            <p className="text-sm text-muted-foreground mt-4">A pre-filled message will be created for you.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {tournament.title}</CardTitle>
        <CardDescription>Fill out the form to enter your team. Entry Fee: ${tournament.entry_fee}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
                <Image src={QR_CODE_URL} width={150} height={150} alt="Payment QR Code" data-ai-hint="qr code" className="rounded-md" />
            </div>
            <div className="space-y-2 text-center sm:text-left">
                <p className="font-semibold">Scan to pay the entry fee.</p>
                <p className="text-sm text-muted-foreground">Or pay directly to the UPI ID:</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 p-2 bg-background rounded-md">
                   <QrCode className="w-5 h-5 text-primary" />
                   <span className="font-mono text-primary font-bold">{ORGANIZER_UPI_ID}</span>
                </div>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="squad_name" render={({ field }) => (
              <FormItem><FormLabel>Squad Name</FormLabel><FormControl><Input placeholder="Enter your squad name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="contact_number" render={({ field }) => (
              <FormItem><FormLabel>Contact Number (WhatsApp)</FormLabel><FormControl><Input type="tel" placeholder="Enter a contact number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Player IDs ({tournament.match_type})</h3>
              {renderPlayerFields()}
            </div>

            <FormField control={form.control} name="user_upi_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Your UPI ID (used for payment)</FormLabel>
                <FormControl><Input placeholder="Enter the UPI ID you paid from" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
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
