
'use client';

import { UserPlus, LogIn, Gamepad2, Trophy } from 'lucide-react';
import Section from './Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Section className="py-20">
      <div className="container">
        <Card className="bg-card/95 border">
            <CardHeader className="text-center">
                <h2 
                    className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                HOW IT WORKS
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your Path to Victory in 4 Simple Steps
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <div className="bg-primary/20 text-primary p-4 rounded-full border-2 border-primary/50 mb-4">
                            <step.icon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{step.heading}</h3>
                        <p className="text-muted-foreground">{step.subtext}</p>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </Section>
  );
};

export default HowItWorks;
