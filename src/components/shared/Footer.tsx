import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { Twitter, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Arena Clash. All Rights Reserved.
          </p>
        </div>
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
    </footer>
  );
}
