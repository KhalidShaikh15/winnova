
'use client';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Home, Trophy, Wallet, BarChart2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin', label: 'Tournaments', icon: Trophy },
  { href: '/admin/results', label: 'Results', icon: BarChart2 },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 border-r bg-card p-4 flex-col">
      <div className="mb-8">
        <Logo />
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant={pathname === link.href ? 'secondary' : 'ghost'}
            className="justify-start"
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full">
            <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
            </Link>
        </Button>
      </div>
    </aside>
  );
}
