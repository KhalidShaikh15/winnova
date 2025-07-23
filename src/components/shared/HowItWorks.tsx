
'use client';

import Image from 'next/image';
import Section from './Section';

const steps = [
  {
    image: '/images/bgmi0.png',
    heading: 'Compete with the Best',
    subtext: 'Join intense BGMI tournaments and test your skills against top-tier players.',
  },
  {
    image: '/images/bgmi1.png',
    heading: 'Win Epic Matches',
    subtext: 'Dominate the battlefield and secure victory with your squad.',
  },
  {
    image: '/images/bgmi2.png',
    heading: 'Rank Up the Leaderboard',
    subtext: 'Every kill and placement counts. Climb to the top with consistent performance.',
  },
  {
    image: '/images/bgmi3.png',
    heading: 'Earn Real Rewards',
    subtext: 'Turn your talent into earnings with cash prizes and exclusive perks.',
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-[#0e0e0e] py-12 md:py-24">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          How It Works
        </h2>
        <div className="space-y-16">
          {steps.map((step, index) => (
            <Section key={index}>
              <div
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${
                  index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image Column */}
                <div className="w-full md:w-1/2">
                  <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                    <Image
                      src={step.image}
                      alt={step.heading}
                      fill
                      className="object-cover rounded-[20px] border-2 border-[#1f1f1f] shadow-lg"
                    />
                  </div>
                </div>

                {/* Text Column */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ lineHeight: '1.2' }}>
                    {step.heading}
                  </h3>
                  <p className="text-lg text-gray-300 max-w-md mx-auto md:mx-0">
                    {step.subtext}
                  </p>
                </div>
              </div>
            </Section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
