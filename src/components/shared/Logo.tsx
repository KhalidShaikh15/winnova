import { Swords } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg font-headline">
      <div className="p-2 bg-primary/20 text-primary rounded-lg">
        <Swords className="h-5 w-5" />
      </div>
      <span>Winnova</span>
    </div>
  );
}
