
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';

const slides = [
  {
    image: '/images/bgmi0.png',
    slogan: 'Compete. Conquer. Collect.',
  },
  {
    image: '/images/bgmi1.png',
    slogan: 'Squad Up. Drop In. Win Big.',
  },
  {
    image: '/images/bgmi2.png',
    slogan: 'One Arena. Infinite Glory.',
  },
  {
    image: '/images/bgmi3.png',
    slogan: 'Rise to the Top. Rule the Game.',
  },
];

const imageVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: 'easeIn' } },
};

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: 'easeIn' } },
};

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-card/90">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-10 px-10 py-20">
        {/* Left Column - Text Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          <div className="h-48 md:h-56 lg:h-64 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={slides[index].slogan}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-headline text-foreground"
              >
                {slides[index].slogan}
              </motion.h1>
            </AnimatePresence>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.8 } }}
            className="text-lg text-muted-foreground mt-4"
          >
            Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.6 } }}
            className="mt-8"
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 py-2 h-auto">
              <Link href="/tournaments">Browse Tournaments</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right Column - Image Slider */}
        <div className="relative w-full max-w-[600px] aspect-square overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0"
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Image
                src={slides[index].image}
                alt={`Slide ${index + 1}: ${slides[index].slogan}`}
                layout="fill"
                objectFit="cover"
                className="rounded-xl shadow-lg"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
