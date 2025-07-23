
'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

const slogans = [
  "Compete. Conquer. Collect.",
  "Squad Up. Drop In. Win Big.",
  "One Arena. Infinite Glory.",
  "Rise to the Top. Rule the Game."
];

const images = [
    '/images/bgmi1.png',
    '/images/bgmi2.png',
    '/images/bgmi3.png',
    '/images/bgmi0.png',
];

export default function HeroSlider() {

  return (
    <section className="w-full bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-10 px-10 pb-20 pt-10">
        {/* Left Column - Text Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-headline text-foreground"
          >
            Compete. Conquer. Collect.
          </h1>
          <p
            className="text-lg text-muted-foreground mt-4"
          >
            Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.
          </p>
          <div
            className="mt-8"
          >
            <Button asChild size="lg" className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold rounded-lg px-6 py-3 h-auto">
              <Link href="/tournaments">Browse Tournaments</Link>
            </Button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative w-full max-w-[600px] aspect-square rounded-lg overflow-hidden">
            <Image
                src="/images/bgmi1.png"
                alt="Arena Clash Hero Image"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
            />
        </div>
      </div>
    </section>
  );
}
