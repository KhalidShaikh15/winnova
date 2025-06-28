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
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { firestore, storage } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

const createSchema = (matchType: 'Solo' | 'Duo' | 'Squad') => {
  let schema = z.object({
    squad_name: z.string().min(3, "Squad name must be at least 3 characters."),
    contact_number: z.string().min(10, "A valid contact number is required."),
    payment_screenshot: z.any().refine(file => file instanceof File, "Screenshot is required."),
  });

  const playerFields: Record<string, any> = {};
  const numPlayers = matchType === 'Solo' ? 1 : matchType === 'Duo' ? 2 : 4;
  for (let i = 1; i <= numPlayers; i++) {
    playerFields[`player${i}_id`] = z.string().min(2, `Player ${i} ID is required.`);
  }

  return schema.extend(playerFields);
};

export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const registrationSchema = createSchema(tournament.match_type);

  const numPlayers = tournament.match_type === 'Solo' ? 1 : tournament.match_type === 'Duo' ? 2 : 4;
  const defaultPlayerValues: Record<string, string> = {};
  for (let i = 1; i <= numPlayers; i++) {
    defaultPlayerValues[`player${i}_id`] = '';
  }

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      squad_name: "",
      contact_number: "",
      ...defaultPlayerValues
    },
  });
  
  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    setLoading(true);
    const { payment_screenshot, ...registrationData } = values;

    try {
      // 1. Upload screenshot to Firebase Storage
      const screenshotFile = values.payment_screenshot as File;
      const storageRef = ref(storage, `payments/${tournament.id}/${Date.now()}_${screenshotFile.name}`);
      const uploadResult = await uploadBytes(storageRef, screenshotFile);
      const screenshotUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save registration to Firestore
      const docData = {
        ...registrationData,
        tournament_id: tournament.id,
        game_name: tournament.game_name,
        payment_screenshot_url: screenshotUrl,
        status: 'pending' as const,
        created_at: Timestamp.now(),
        match_slot: 'TBD', // Or some other logic
      };
      
      await addDoc(collection(firestore, 'registrations'), docData);

      toast({
        title: "Registration Submitted!",
        description: "Your team has been registered. You will be notified upon confirmation.",
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Registration Failed",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }
  
  const renderPlayerFields = () => {
    const numPlayers = tournament.match_type === 'Solo' ? 1 : tournament.match_type === 'Duo' ? 2 : 4;
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
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {tournament.title}</CardTitle>
        <CardDescription>Fill out the form to enter your team. Entry Fee: ${tournament.entry_fee}</CardDescription>
      </CardHeader>
      <CardContent>
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

            <FormField control={form.control} name="payment_screenshot" render={({ field: { onChange, ...fieldProps} }) => (
                <FormItem>
                    <FormLabel>UPI Payment Screenshot</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
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
