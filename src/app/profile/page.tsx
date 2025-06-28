'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { moderateImage } from "@/lib/actions"
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }).max(30, {
    message: "Username must not be longer than 30 characters.",
  }),
  email: z.string().email(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { toast } = useToast()
  const [avatarPreview, setAvatarPreview] = useState("https://placehold.co/100x100.png")
  const [isModerating, setIsModerating] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: 'gamer_user',
      email: 'user@example.com',
    },
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 4MB.",
      });
      return;
    }

    setIsModerating(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      
      try {
        const moderationResult = await moderateImage(base64Image);
        if (moderationResult.isSafe) {
          setAvatarPreview(base64Image);
          toast({
            title: "Avatar Updated",
            description: "Your new avatar looks great!",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed: Content Policy Violation",
            description: moderationResult.reason || "This image is not permitted.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: "Could not moderate the image. Please try again.",
        });
      } finally {
        setIsModerating(false);
      }
    };
    reader.onerror = () => {
        setIsModerating(false);
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
    }
  }

  return (
    <div className="container py-12">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">My Profile</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Manage your account settings and profile information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} alt="User avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  {isModerating && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white"/>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="picture">Profile Picture</Label>
                  <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={isModerating} />
                  <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 4MB max. Image will be checked by AI.</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
