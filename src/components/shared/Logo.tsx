import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
      <Image src="/images/32x32.png" alt="Winnova Logo" width={32} height={32} />
      <span>Winnova</span>
    </Link>
  );
}
