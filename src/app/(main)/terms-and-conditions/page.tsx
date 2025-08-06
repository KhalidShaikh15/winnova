
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms &amp; Conditions – Winnova Tournaments</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Last Updated: August 6, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            By registering or participating in any tournament hosted on <strong>Winnova.in</strong>, you agree to the following terms:
          </p>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">1. Eligibility</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Participants must be <strong>13 years of age or older</strong>.</li>
              <li>A <strong>valid in-game ID</strong> is required.</li>
              <li>Only <strong>registered and verified players</strong> are allowed to participate.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">2. Registration</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Entry fees must be paid in full via <strong>UPI/QR code</strong> before the registration deadline.</li>
              <li>Registration is <strong>confirmed only after payment verification</strong>.</li>
              <li>Incomplete or unpaid entries will not be allowed.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">3. Gameplay Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Cheating, teaming, or using emulators</strong> (if not permitted for that tournament) will lead to <strong>instant disqualification</strong>.</li>
              <li><strong>Respect all players and admins</strong> – abusive language or behavior is strictly prohibited.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">4. Prizes</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Prize pool will be distributed via <strong>UPI or Bank Transfer</strong> within <strong>24–48 hours</strong> after tournament completion.</li>
              <li>Any <strong>fraudulent claim</strong> will result in <strong>disqualification and a permanent ban</strong>.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">5. Refund Policy</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>No refunds</strong> will be issued unless the event is canceled by the admin.</li>
              <li>In case of <strong>technical issues</strong>, a re-match may be scheduled at the admin’s discretion.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">6. Admin Rights</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Winnova</strong> reserves the right to:
                <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Change tournament rules</li>
                    <li>Reschedule matches</li>
                    <li>Disqualify any participant for misconduct or violations</li>
                </ul>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">7. Disclaimer</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Winnova is <strong>not affiliated</strong> with BGMI, Free Fire, Clash of Clans (COC), or any other official game brand.</li>
              <li>Tournaments are conducted <strong>independently for community and entertainment purposes</strong>.</li>
            </ul>
          </div>
          <div className="border-t pt-6 text-center">
            <p>For queries, contact us at: <a href="mailto:support@winnova.in" className="font-semibold text-primary hover:underline">support@winnova.in</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
