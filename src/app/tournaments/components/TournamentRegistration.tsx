'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Tournament } from "@/lib/types"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { Award, Calendar, Gamepad2, Group, Loader2, Send, Clock, Download } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { format } from "date-fns"
import { QRCodeCanvas } from 'qrcode.react';

// Base schema for common fields
const baseSchema = z.object({
    squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
    contact_number: z.string().min(10, "A valid contact number is required."),
    user_upi_id: z.string().optional(),
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
  const qrRef = useRef<HTMLDivElement>(null);

  const registrationSchema = useMemo(() => {
    const dynamicSchema = tournament.game_name === "Clash of Clans" ? strategyGameSchema : shooterGameSchema;
    
    if (tournament.entry_fee > 0) {
      return dynamicSchema.extend({
        user_upi_id: z.string().min(3, "Please enter the UPI ID you used for payment."),
      })
    }
    return dynamicSchema;
  }, [tournament.game_name, tournament.entry_fee]);
  
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
  
  const upiLink = useMemo(() => {
    if (tournament.entry_fee > 0) {
        return `upi://pay?pa=9653134660@kotak811&pn=Khalid%20Shaikh&am=${tournament.entry_fee}&cu=INR`;
    }
    return null;
  }, [tournament.entry_fee]);

  const handleDownloadQR = () => {
    if (qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `winnova-payment-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }
  };


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
      setSubmittedUpiId(values.user_upi_id || "");
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
    if (!submittedUpiId || !tournament.allow_whatsapp || !tournament.whatsapp_number) return;
    const message = `Hey, I have registered for ${tournament.title} with UPI ID ${submittedUpiId}`;
    const whatsappUrl = `https://wa.me/91${tournament.whatsapp_number}?text=${encodeURIComponent(message)}`;
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
           {tournament.allow_whatsapp && submittedUpiId && (
                <CardContent className="text-center">
                    <Button size="lg" onClick={handleContactOrganizer}>
                        <Send className="mr-2 h-4 w-4"/>
                        Contact on WhatsApp
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">Click the button to confirm your slot with the organizer.</p>
                </CardContent>
            )}
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

        {upiLink && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border flex flex-col items-center gap-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div ref={qrRef} className="bg-white p-2 rounded-md">
                <QRCodeCanvas value={upiLink} size={128} />
              </div>
              <h3 className="font-bold text-lg">Scan to Pay ₹{tournament.entry_fee}</h3>
              <p className="text-sm text-muted-foreground mt-2 font-mono break-all">
                  Or pay to: {tournament.upi_id}
              </p>
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4"/>
                  Download QR
              </Button>
            </div>
            <div className="w-full text-center">
                <p className="text-xs text-muted-foreground mt-4">
                    After paying, please enter your UPI ID in the form below for verification.
                </p>
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
                  <FormDescription>
                    This is required to verify your payment.
                  </FormDescription>
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
