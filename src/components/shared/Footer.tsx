
import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { Twitter, Instagram, Facebook, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0d0d0d] text-white">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              The ultimate platform for competitive gaming tournaments.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Legal</h4>
            <Link href="/terms-and-conditions" className="text-sm text-white hover:text-primary">Terms of Service</Link>
            <Link href="/refund-policy" className="text-sm text-white hover:text-primary">Refund Policy</Link>
            <Link href="/privacy-policy" className="text-sm text-white hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-white hover:text-primary">Contact Us</Link>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold">Support</h4>
             <a href="mailto:support@winnova.com" className="flex items-center gap-2 text-sm text-white hover:text-primary">
                <Mail className="w-4 h-4" />
                support@winnova.com
             </a>
             <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white hover:text-primary">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
             </a>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold">Follow Us</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Twitter className="h-4 w-4"/></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                  <Link href="https://www.instagram.com/arenaclash.in" target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4"/></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Facebook className="h-4 w-4"/></Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center">
           <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Winnova. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
