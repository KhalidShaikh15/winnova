import type { Metadata } from 'next';
import './globals.css';
import { Exo_2 } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo-2',
});

export const metadata: Metadata = {
  title: 'Winnova',
  description: 'The ultimate platform for competitive gaming tournaments.',
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-body antialiased', exo2.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
