"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ThemeToggle";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";


export default function Header() {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
             {navLinks.map(link => (
                 <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        pathname === link.href ? "text-foreground" : "text-foreground/60"
                    )}
                >
                    {link.label}
                 </Link>
             ))}
             {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "transition-colors hover:text-foreground/80 font-medium",
                    pathname.startsWith('/admin') ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  Admin Panel
                </Link>
             )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? (
             <Loader2 className="h-6 w-6 animate-spin" />
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                      {user.email && <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
