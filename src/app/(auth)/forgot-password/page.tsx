'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { sendPasswordResetEmail, type ActionCodeSettings } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const actionCodeSettings: ActionCodeSettings = {
    url: 'https://www.winnova.in',
    handleCodeInApp: true,
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Firebase is not configured correctly.",
      });
      setLoading(false);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSubmitted(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
        <div className="w-full max-w-sm px-4 text-center">
            <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Check Your Email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a password reset link to <strong>{email}</strong>.
                    </CardDescription>
                </CardHeader>
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
            <form onSubmit={handlePasswordReset}>
            <CardHeader>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                Enter your email and we&apos;ll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit" disabled={loading || !auth}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="mt-4 text-center text-sm">
                 Remember your password?{" "}
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
