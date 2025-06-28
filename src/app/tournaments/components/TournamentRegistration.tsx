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
import type { Tournament } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const createSchema = (matchType: 'Solo' | 'Duo' | 'Squad') => {
  let schema = z.object({
    teamName: z.string().min(3, "Team name must be at least 3 characters."),
    email: z.string().email(),
  });

  if (matchType === 'Solo') {
    schema = schema.extend({
      player1: z.string().min(2, "Player name is required."),
    });
  } else if (matchType === 'Duo') {
    schema = schema.extend({
      player1: z.string().min(2, "Player 1 name is required."),
      player2: z.string().min(2, "Player 2 name is required."),
    });
  } else if (matchType === 'Squad') {
    schema = schema.extend({
      player1: z.string().min(2, "Player 1 name is required."),
      player2: z.string().min(2, "Player 2 name is required."),
      player3: z.string().min(2, "Player 3 name is required."),
      player4: z.string().min(2, "Player 4 name is required."),
      player5: z.string().min(2, "Player 5 name is required."),
    });
  }

  return schema;
};

export default function TournamentRegistration({ tournament }: { tournament: Tournament }) {
  const [matchType, setMatchType] = useState<'Solo' | 'Duo' | 'Squad'>(tournament.matchType);
  const { toast } = useToast();

  const form = useForm<z.infer<ReturnType<typeof createSchema>>>({
    resolver: zodResolver(createSchema(matchType)),
    defaultValues: {
      teamName: "",
      email: "",
      player1: "",
      player2: "",
      player3: "",
      player4: "",
      player5: "",
    },
  });
  
  function onSubmit(values: z.infer<ReturnType<typeof createSchema>>) {
    console.log(values)
    toast({
      title: "Registration Submitted!",
      description: "Your team has been registered for the tournament.",
    })
    form.reset();
  }
  
  const renderPlayerFields = () => {
    switch (matchType) {
      case 'Solo':
        return <FormField control={form.control} name="player1" render={({ field }) => ( <FormItem><FormLabel>Player IGN</FormLabel><FormControl><Input placeholder="Your In-Game Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
      case 'Duo':
        return (
          <>
            <FormField control={form.control} name="player1" render={({ field }) => ( <FormItem><FormLabel>Player 1 IGN</FormLabel><FormControl><Input placeholder="Player 1 In-Game Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="player2" render={({ field }) => ( <FormItem><FormLabel>Player 2 IGN</FormLabel><FormControl><Input placeholder="Player 2 In-Game Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </>
        )
      case 'Squad':
        return (
          <>
            {[1, 2, 3, 4, 5].map(num => (
              <FormField key={num} control={form.control} name={`player${num}` as any} render={({ field }) => ( <FormItem><FormLabel>Player {num} IGN</FormLabel><FormControl><Input placeholder={`Player ${num} In-Game Name`} {...field} /></FormControl><FormMessage /></FormItem> )} />
            ))}
          </>
        )
      default:
        return null;
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {tournament.title}</CardTitle>
        <CardDescription>Fill out the form below to enter your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="team@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
                <FormLabel>Match Type</FormLabel>
                 <FormControl>
                    <RadioGroup
                        onValueChange={(value) => setMatchType(value as 'Solo' | 'Duo' | 'Squad')}
                        defaultValue={matchType}
                        className="flex space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="Solo" />
                            </FormControl>
                            <FormLabel className="font-normal">Solo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="Duo" />
                            </FormControl>
                            <FormLabel className="font-normal">Duo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="Squad" />
                            </FormControl>
                            <FormLabel className="font-normal">Squad</FormLabel>
                        </FormItem>
                    </RadioGroup>
                </FormControl>
            </FormItem>
            
            <div className="space-y-4">
              {renderPlayerFields()}
            </div>
            
            <Button type="submit" className="w-full">Register Team</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
