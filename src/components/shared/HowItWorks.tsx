
'use client';

import { UserPlus, LogIn, Gamepad2, Trophy } from 'lucide-react';
import Section from './Section';

const steps = [
  {
    icon: UserPlus,
    heading: '1. Register',
    subtext: 'Create your account to get started.',
  },
  {
    icon: LogIn,
    heading: '2. Join a Match',
    subtext: 'Browse tournaments and secure your slot.',
  },
  {
    icon: Gamepad2,
    heading: '3. Play & Compete',
    subtext: 'Receive credentials, play with skill, and dominate.',
  },
  {
    icon: Trophy,
    heading: '4. Win & Withdraw',
    subtext: 'Winnings are credited to your wallet.',
  },
];

const HowItWorks = () => {
  return (
    <Section className="bg-[#0e0e0e] py-20">
      <div className="container text-center">
        <h2 
            className="text-4xl md:text-5xl font-bold text-green-400 mb-4"
            style={{ textShadow: '0 0 15px rgba(107, 255, 129, 0.7)' }}
        >
          HOW IT WORKS
        </h2>
        <p className="text-lg text-muted-foreground mb-16">
          Your Path to Victory in 4 Simple Steps
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center p-6 rounded-lg bg-card/5 border border-white/10 transition-all hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10">
              <div className="mb-6 bg-green-500/20 text-green-400 p-4 rounded-full border-2 border-green-400/50">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.heading}</h3>
              <p className="text-muted-foreground">{step.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
