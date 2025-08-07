'use client';

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so we can safely check the theme.
  useEffect(() => {
    setMounted(true);
  }, []);

  // On the server, we can render a placeholder or nothing to avoid hydration mismatch
  if (!mounted) {
    return (
        <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
            <div style={{width: 32, height: 32}} />
            <span>Winnova</span>
        </Link>
    );
  }

  const logoSrc = resolvedTheme === 'dark' ? '/images/64x64.png' : '/images/logo_64x64 (1).png';
  const logoAlt = resolvedTheme === 'dark' ? 'Winnova Logo Dark' : 'Winnova Logo Light';

  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
      <Image src={logoSrc} alt={logoAlt} width={32} height={32} />
      <span>Winnova</span>
    </Link>
  );
}
