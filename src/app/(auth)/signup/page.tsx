'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, type ActionCodeSettings } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const actionCodeSettings: ActionCodeSettings = {
    url: 'https://app.winnova.in/login',
    handleCodeInApp: true,
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: "Password should be at least 6 characters.",
        });
        return;
    }
    setLoading(true);
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Firebase is not configured correctly.",
      });
      setLoading(false);
      return;
    }
    try {
      // Check if username is already taken
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: "Username is already taken. Please choose another one.",
        });
        setLoading(false);
        return;
      }


      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username,
        });

        // Create user document in firestore
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            username: username,
            email: email,
            createdAt: new Date(),
        });

        window.localStorage.setItem('emailForSignIn', email);
        await sendEmailVerification(userCredential.user, actionCodeSettings);
      }
      setIsSignedUp(true);
      toast({
        title: "Account Created!",
        description: "A verification email has been sent. Please check your inbox.",
      });
    } catch (error: any) {
      let description = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already in use. Please try another one.";
      } else {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSignedUp) {
    return (
        <div className="w-full max-w-sm px-4 text-center">
             <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to complete your registration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">After verifying, you can log in.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }


  return (
    <div className="w-full max-w-sm px-4">
        <div className="flex justify-center mb-6">
            <Logo />
        </div>
        <Card>
            <form onSubmit={handleSignup}>
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                Enter your information to create an account.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="gamer_tag" required value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit" disabled={loading || !auth}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
                </Button>
                {!auth && (
                    <p className="mt-2 text-xs text-destructive text-center">
                        Firebase is not configured. Please add your credentials to the .env file.
                    </p>
                )}
                <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Login
                </Link>
                </div>
            </CardFooter>
            </form>
        </Card>
    </div>
  );
}
