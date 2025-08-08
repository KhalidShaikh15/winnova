'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendEmailVerification, type ActionCodeSettings } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const actionCodeSettings: ActionCodeSettings = {
    url: 'https://battlebuck-15.firebaseapp.com/__/auth/action',
    handleCodeInApp: true,
  };

  const handleResendVerification = async () => {
    if (!auth || !auth.currentUser) return;
    setResending(true);
    try {
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        toast({
            title: "Verification Email Sent",
            description: "A new verification link has been sent to your email address."
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to Resend",
            description: error.message
        });
    } finally {
        setResending(false);
    }
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Firebase is not configured correctly.",
      });
      setLoading(false);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast({
            variant: "destructive",
            title: "Email Not Verified",
            description: "Please verify your email before logging in.",
            action: <Button variant="secondary" size="sm" onClick={handleResendVerification} disabled={resending}>{resending ? 'Sending...': 'Resend'}</Button>
        });
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Winnova!",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4">
        <div className="flex justify-center mb-6">
            <Logo />
        </div>
        <Card>
            <form onSubmit={handleLogin}>
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                Enter your email below to login to your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Link>
                    </div>
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
                {loading ? "Signing in..." : "Sign in"}
                </Button>
                {!auth && (
                    <p className="mt-2 text-xs text-destructive text-center">
                        Firebase is not configured. Please add your credentials to the .env file.
                    </p>
                )}
                <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
                </div>
            </CardFooter>
            </form>
        </Card>
    </div>
  );
}
