
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
import { User, LogOut, Loader2, ShieldCheck, Menu, Trophy, Wallet, BarChart2, Home } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

export default function Header() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const loading = authLoading || adminLoading;

  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  const adminNavLinks = [
    { href: '/admin', label: 'Tournaments', icon: Trophy },
    { href: '/admin/results', label: 'Results', icon: BarChart2 },
    { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
    { href: '/', label: 'Back to Site', icon: Home },
  ];
  
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

  const isAnAdminPage = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex items-center">
          <div className="mr-6 flex items-center space-x-2">
            <Logo />
          </div>
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
             {isAdmin && !isAnAdminPage && (
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
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
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
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <nav className="hidden items-center gap-2 md:flex">
              <Button asChild variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          )}
          
          <ThemeToggle />

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] p-2">
                 {isAnAdminPage && isAdmin ? (
                   <>
                    {adminNavLinks.map((link, index) => (
                      <React.Fragment key={`mobile-admin-${link.href}`}>
                       <DropdownMenuItem asChild className="justify-center py-2 text-base">
                         <Link href={link.href}><link.icon className="mr-2 h-4 w-4"/>{link.label}</Link>
                       </DropdownMenuItem>
                       {index < adminNavLinks.length - 1 && <DropdownMenuSeparator />}
                      </React.Fragment>
                     ))}
                   </>
                 ) : (
                   <>
                    {navLinks.map((link, index) => (
                      <React.Fragment key={`mobile-${link.href}`}>
                        <DropdownMenuItem asChild className="justify-center py-2 text-base">
                          <Link href={link.href}>{link.label}</Link>
                        </DropdownMenuItem>
                        {index < navLinks.length -1 && <DropdownMenuSeparator />}
                      </React.Fragment>
                      ))}
                      {isAdmin && (
                        <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="justify-center py-2 text-base">
                          <Link href="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      {!user && !loading && (
                        <DropdownMenuItem asChild className="justify-center py-2 text-base">
                            <Link href="/login">Login</Link>
                        </DropdownMenuItem>
                      )}
                   </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
