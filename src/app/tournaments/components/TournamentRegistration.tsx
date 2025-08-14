
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Tournament } from "@/lib/types"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { firestore, functions } from "@/lib/firebase"
import { Award, Calendar, Gamepad2, Group, Loader2, Send, Clock, Download, ClipboardCopy, Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { format } from "date-fns"
import { QRCodeCanvas } from 'qrcode.react';
import { httpsCallable } from "firebase/functions";

const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUpiId, setSubmittedUpiId] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, []);

  const registrationSchema = useMemo(() => {
    const baseFields = {
      squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
      contact_number: z.string().min(10, "A valid contact number is required."),
    };

    const gameSpecificFields = tournament.game_name === "Clash of Clans"
      ? { clan_tag: z.string().min(2, "Clan Tag is required.") }
      : {
          player1_bgmi_id: z.string().min(2, "Player 1 ID is required."),
          player2_bgmi_id: z.string().min(2, "Player 2 ID is required."),
          player3_bgmi_id: z.string().min(2, "Player 3 ID is required."),
          player4_bgmi_id: z.string().min(2, "Player 4 ID is required."),
        };

    const paymentField = tournament.entry_fee > 0
      ? { user_upi_id: z.string().regex(UPI_ID_REGEX, "Please enter a valid UPI ID (e.g., name@bank).") }
      : { user_upi_id: z.string().optional() };

    const combinedSchema = z.object({
      ...baseFields,
      ...gameSpecificFields,
      ...paymentField,
    });
    
    if (tournament.game_name !== "Clash of Clans") {
       return combinedSchema.refine(data => {
            const ids = [data.player1_bgmi_id, data.player2_bgmi_id, data.player3_bgmi_id, data.player4_bgmi_id];
            const uniqueIds = new Set(ids);
            return uniqueIds.size === ids.length;
        }, {
            message: "Player IDs must be unique within your team.",
            path: ["player1_bgmi_id"],
        });
    }

    return combinedSchema;
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
        return `upi://pay?pa=${tournament.upi_id}&pn=Khalid%20Shaikh&am=${tournament.entry_fee}&cu=INR`;
    }
    return null;
  }, [tournament.entry_fee, tournament.upi_id]);

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

  const handleCopyUpi = () => {
    if (!tournament.upi_id) return;
    navigator.clipboard.writeText(tournament.upi_id);
    setIsCopied(true);
    toast({ title: "UPI ID Copied!", description: "You can now paste it in your payment app." });
    setTimeout(() => setIsCopied(false), 2000);
  };


  async function onSubmit(values: RegistrationFormValues) {
    if (!firestore || !functions) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firebase services are not available. Please try again later.",
        });
        return;
    }
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
      // Check for duplicate squad name
      const checkDuplicateRegistration = httpsCallable(functions, 'checkDuplicateRegistration');
      const squadNameResult: any = await checkDuplicateRegistration({
          tournament_id: tournament.id,
          squad_name_lowercase: values.squad_name.toLowerCase(),
      });
      if (squadNameResult.data.duplicateFound) {
          toast({
              variant: "destructive",
              title: "Squad Name Taken",
              description: `A squad with the name "${values.squad_name}" is already registered. Please choose another name.`,
          });
          setLoading(false);
          return;
      }

       let player_ids: string[] = [];
       if ('player1_bgmi_id' in values) {
         player_ids = [
           values.player1_bgmi_id,
           values.player2_bgmi_id,
           values.player3_bgmi_id,
           values.player4_bgmi_id
         ].filter(Boolean) as string[];
       } else if ('clan_tag' in values) {
         player_ids = [values.clan_tag as string];
       }

      // Call the Cloud Function to check for duplicate player IDs
      const checkDuplicatePlayerIds = httpsCallable(functions, 'checkDuplicatePlayerIds');
      const result: any = await checkDuplicatePlayerIds({
          tournamentId: tournament.id,
          playerIds: player_ids,
      });

      if (result.data.duplicateFound) {
          toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "One or more of these Player IDs are already registered for this tournament.",
          });
          setLoading(false);
          return;
      }

      const docData = {
        ...values,
        squad_name_lowercase: values.squad_name.toLowerCase(),
        player_ids,
        user_id: user.uid,
        username: user.displayName || user.email || 'Anonymous',
        user_email: user.email,
        tournament_id: tournament.id,
        tournament_title: tournament.title,
        game_name: tournament.game_name,
        status: 'pending' as const,
        created_at: serverTimestamp(),
        slot: 'A',
      };
      
      await addDoc(collection(firestore, 'registrations'), docData);

      toast({
        title: "Registration Submitted!",
        description: "Your team registration has been submitted for review.",
      });
      setSubmittedUpiId(values.user_upi_id || "");
      setIsSubmitted(true);
      form.reset();
    } catch (error: any) {
        console.error("Registration submission error:", error);
        const errorMessage = error.details?.message || error.message || "An unexpected error occurred. Please try again.";
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

        {isClient && upiLink && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border flex flex-col items-center gap-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div ref={qrRef} className="bg-white p-2 rounded-md">
                <QRCodeCanvas value={upiLink} size={128} />
              </div>
              <h3 className="font-bold text-lg">Scan to Pay ₹{tournament.entry_fee}</h3>
               <div className="text-center">
                 <p className="text-sm text-muted-foreground">Or pay to:</p>
                 <div className="flex items-center gap-2 mt-1 bg-background px-3 py-2 rounded-md border">
                    <span className="font-mono text-sm break-all">
                        {tournament.upi_id}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleCopyUpi} className="h-7 w-7">
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                    </Button>
                 </div>
               </div>
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
                    <FormField control={form.control} name="player4_bgmi_id" render={({ field }) => ( <FormItem><FormLabel>Player 4 ID</FormLabel><FormControl><Input placeholder="Enter Player 4 ID" {...field} /></FormControl><FormMessage /></FormMessage> )} />
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
