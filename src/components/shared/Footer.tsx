import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { Twitter, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              The ultimate platform for competitive gaming tournaments.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Quick Links</h4>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/tournaments" className="text-sm text-muted-foreground hover:text-primary">Tournaments</Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-primary">Leaderboard</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Login/Sign Up</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Legal</h4>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold">Follow Us</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Twitter className="h-4 w-4"/></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Instagram className="h-4 w-4"/></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Facebook className="h-4 w-4"/></Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-6 text-center">
           <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Arena Clash. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
