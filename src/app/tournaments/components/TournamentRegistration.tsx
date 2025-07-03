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

const registrationSchema = z.object({
    squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
    contact_number: z.string().min(10, "A valid contact number is required."),
    match_slot: z.string().min(1, "Match slot details are required."),
    user_upi_id: z.string().min(3, "Please enter the UPI ID you used for payment."),
    player1_bgmi_id: z.string().min(2, `Player 1 ID is required.`),
    player2_bgmi_id: z.string().min(2, `Player 2 ID is required.`),
    player3_bgmi_id: z.string().min(2, `Player 3 ID is required.`),
    player4_bgmi_id: z.string().min(2, `Player 4 ID is required.`),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const qrCodeMap: { [key: number]: string } = {
    500: 'https://i.ibb.co/tRtNphp/qr-500-battlebuck.png',
    800: 'https://i.ibb.co/Ng788VxR/qr-800-battlebuck.png',
    1000: 'https://i.ibb.co/Q3Z638nT/qr-1000-battlebuck.png',
    1200: 'https://i.ibb.co/spLRR5bD/qr-1200-battlebuck.png',
};

export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormValues | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
        squad_name: "",
        contact_number: "",
        user_upi_id: "",
        match_slot: "TBD",
        player1_bgmi_id: "",
        player2_bgmi_id: "",
        player3_bgmi_id: "",
        player4_bgmi_id: "",
    },
  });

  const qrCodeUrl = tournament.entry_fee > 0 ? qrCodeMap[tournament.entry_fee] : null;

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
      const docData: any = {
        ...values,
        user_id: user.uid,
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
    if (!submittedData || !tournament.allow_whatsapp) return;
    const message = `Hey, I just registered for the ${tournament.title} tournament with UPI ID ${submittedData.user_upi_id}. Please confirm my slot.`;
    const whatsappUrl = `https://wa.me/${tournament.whatsapp_number}?text=${encodeURIComponent(message)}`;
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
        <CardHeader>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>
            {tournament.allow_whatsapp
              ? "Your registration has been submitted. Click the button below to contact the organizer on WhatsApp and confirm your slot."
              : "Your registration has been submitted! You will be notified once it is confirmed."}
          </CardDescription>
        </CardHeader>
        {tournament.allow_whatsapp && (
            <CardContent className="text-center">
                <Button size="lg" onClick={handleContactOrganizer}>
                    <Send className="mr-2"/>
                    Contact on WhatsApp
                </Button>
                <p className="text-sm text-muted-foreground mt-4">A pre-filled message will be created for you.</p>
            </CardContent>
        )}
      </Card>
    )
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {tournament.title}</CardTitle>
        <CardDescription>
            {tournament.entry_fee > 0 ? `Fill out the form to enter your team. Entry Fee: ₹${tournament.entry_fee}` : 'This is a free tournament. Fill out the form to enter your team.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tournament.entry_fee > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-center gap-4">
              {qrCodeUrl ? 
                <div className="flex-shrink-0">
                    <Image src={qrCodeUrl} alt="Payment QR Code" width={150} height={150} className="rounded-md" />
                </div>
              :
                <div className="flex-shrink-0 flex items-center justify-center w-[150px] h-[150px] bg-background rounded-md">
                    <p className="text-sm text-muted-foreground text-center">QR Code not available for this fee amount.</p>
                </div>
              }
              <div className="space-y-2 text-center sm:text-left">
                  <p className="font-semibold">Scan to pay the entry fee of ₹{tournament.entry_fee}.</p>
                  <p className="text-sm text-muted-foreground">Or pay directly to the UPI ID:</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 p-2 bg-background rounded-md">
                     <QrCode className="w-5 h-5 text-primary" />
                     <span className="font-mono text-primary font-bold">{tournament.upi_id}</span>
                  </div>
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Player In-Game IDs</h3>
              <FormField control={form.control} name="player1_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 1 ID</FormLabel><FormControl><Input placeholder="Enter Player 1 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="player2_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 2 ID</FormLabel><FormControl><Input placeholder="Enter Player 2 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="player3_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 3 ID</FormLabel><FormControl><Input placeholder="Enter Player 3 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="player4_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 4 ID</FormLabel><FormControl><Input placeholder="Enter Player 4 ID" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <FormField control={form.control} name="match_slot" render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Slot Details</FormLabel>
                  <FormControl><Input placeholder="e.g. Group A, Slot 5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            
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
