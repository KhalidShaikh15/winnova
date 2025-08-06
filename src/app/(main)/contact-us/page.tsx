
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <span role="img" aria-label="telephone">📞</span> Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center text-muted-foreground">
            <p>Have a question or need support? Reach out via:</p>
            <div className="flex flex-col items-center gap-4">
                <a href="mailto:support@winnova.in" className="flex items-center gap-2 text-foreground hover:text-primary font-semibold">
                    <Mail className="w-5 h-5"/>
                    <span>Email: support@winnova.in</span>
                </a>
                <a href="https://www.instagram.com/winnova.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary font-semibold">
                    <Instagram className="w-5 h-5"/>
                    <span>Instagram: winnova.in</span>
                </a>
            </div>
            <p className="text-sm">We typically respond within 24 hours.</p>
        </CardContent>
      </Card>
    </div>
  );
}
