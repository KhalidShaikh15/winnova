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
import { useState, useEffect } from "react"
import { moderateImage } from "@/lib/actions"
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [avatarPreview, setAvatarPreview] = useState("https://placehold.co/100x100.png")
  const [isModerating, setIsModerating] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.displayName || '',
        email: user.email || '',
      });
      if (user.photoURL) {
        setAvatarPreview(user.photoURL);
      } else {
        setAvatarPreview("https://placehold.co/100x100.png");
      }
    }
  }, [user, form]);

  useEffect(() => {
      if (!authLoading && !user) {
          router.push('/login');
          toast({
              variant: 'destructive',
              title: 'Not Authenticated',
              description: 'Please log in to view your profile.',
          });
      }
  }, [user, authLoading, router, toast]);

  const getInitials = (name: string | null | undefined, email: string | null | undefined): string => {
    if (name) {
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        if (parts.length === 1 && parts[0].length > 0) {
            return parts[0][0].toUpperCase();
        }
    }
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsUpdatingProfile(true);

    try {
      await updateProfile(user, {
        displayName: data.username,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
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
          // In a real app, you would upload to Firebase Storage and get a URL.
          // For now, we will just update the profile with the base64 data URI.
          await updateProfile(user, { photoURL: base64Image });
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
          description: "Could not update the avatar. Please try again.",
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
  
  if (authLoading || !user) {
    return (
        <div className="container py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
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
                    <AvatarImage src={avatarPreview} alt={user?.displayName || "User avatar"} />
                    <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
                  </Avatar>
                  {isModerating && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white"/>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="picture">Profile Picture</Label>
                  <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={isModerating || isUpdatingProfile} />
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
                      <Input placeholder="your@email.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isModerating || isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUpdatingProfile ? 'Updating...' : 'Update profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
