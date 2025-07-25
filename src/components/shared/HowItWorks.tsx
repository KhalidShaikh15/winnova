
'use client';

import { UserPlus, LogIn, Gamepad2, Trophy } from 'lucide-react';
import Section from './Section';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: UserPlus,
    heading: '1. Register',
    subtext: 'Create your account to get started.',
    description: 'Getting started is quick and easy. Simply create an account to join the Arena Clash community.'
  },
  {
    icon: LogIn,
    heading: '2. Join a Match',
    subtext: 'Browse tournaments and secure your slot.',
    description: 'Explore our list of upcoming tournaments. Find the perfect challenge for your skills.'
  },
  {
    icon: Gamepad2,
    heading: '3. Play & Compete',
    subtext: 'Receive credentials, play with skill, and dominate.',
    description: 'Join the lobby at the scheduled time, coordinate with your team, and get ready to play.'
  },
  {
    icon: Trophy,
    heading: '4. Win & Withdraw',
    subtext: 'Winnings are credited to your wallet.',
    description: 'After the tournament, results are verified. If you’re a winner, your prize money will be credited.'
  },
];

const HowItWorks = () => {
  return (
    <Section className="py-20 bg-background">
      <div className="container">
        <Card className="p-8">
            <div className="text-center mb-12">
                <h2 
                    className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                HOW IT WORKS
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your Path to Victory in 4 Simple Steps
                </p>
            </div>
            <div className="space-y-16">
            {steps.map((step, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left Column: Description */}
                <div className="text-muted-foreground text-center md:text-left">
                    <p>{step.description}</p>
                </div>

                {/* Right Column: Step Card */}
                <Card className="bg-card/95 border w-64 h-64 mx-auto">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                        <div className="bg-primary/20 text-primary p-4 rounded-full border-2 border-primary/50 mb-4">
                            <step.icon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{step.heading}</h3>
                        <p className="text-muted-foreground">{step.subtext}</p>
                    </CardContent>
                </Card>
                </div>
            ))}
            </div>
        </Card>
      </div>
    </Section>
  );
};

export default HowItWorks;
