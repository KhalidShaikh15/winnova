import { Swords } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
      <div className="p-2 bg-primary/20 text-primary rounded-lg">
        <Swords className="h-5 w-5" />
      </div>
      <span>Winnova</span>
    </Link>
  );
}
