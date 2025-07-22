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
  enter: { opacity: 0, x: 100 },
  center: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.8, ease: 'easeInOut' } },
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
    <section className="relative w-full bg-card/90 py-16 md:py-24 lg:py-32">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={slides[index].slogan}
                        variants={textVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter drop-shadow-2xl font-headline text-foreground h-48 md:h-56 lg:h-64"
                    >
                        {slides[index].slogan}
                    </motion.h1>
                </AnimatePresence>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
                    className="max-w-[600px] text-muted-foreground md:text-xl mt-4"
                >
                    Your ultimate destination for high-stakes gaming tournaments. Join thousands of players, showcase your talent, and win incredible prizes.
                </motion.p>
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

            {/* Right Column - Image Slider */}
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={index}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute w-[600px] h-[600px]"
                    >
                        <Image
                            src={slides[index].image}
                            alt={`Slide ${index + 1}`}
                            width={600}
                            height={600}
                            objectFit="cover"
                            className="rounded-xl shadow-2xl"
                            priority={index === 0}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </section>
  );
}
