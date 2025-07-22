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

const variants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
};

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
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
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={slides[index].image}
            alt={`Slide ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <AnimatePresence mode="wait">
            <motion.h1
            key={slides[index].slogan}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter drop-shadow-2xl font-headline"
            >
            {slides[index].slogan}
            </motion.h1>
        </AnimatePresence>
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.6 } }}
            className="mt-8"
        >
            <Button asChild size="lg">
                <Link href="/tournaments">Browse Tournaments</Link>
            </Button>
        </motion.div>
      </div>
    </section>
  );
}
