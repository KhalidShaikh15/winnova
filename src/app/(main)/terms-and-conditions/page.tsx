import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms &amp; Conditions – Winnova Tournaments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">1. Eligibility</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Participants must have valid game IDs and be above 13 years of age.</li>
              <li>Only registered players are allowed to participate.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">2. Registration</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Entry fees must be paid in full via UPI/QR before the registration deadline.</li>
              <li>Registrations are confirmed only after payment is verified.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">3. Gameplay Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Cheating, teaming, or using emulators (if not allowed) will lead to disqualification.</li>
              <li>Respect all opponents and admins; abusive behavior is not tolerated.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">4. Prizes</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Prize pool will be distributed via UPI/Bank transfer to the winners within 24–48 hours.</li>
              <li>Any fraudulent claims will result in a permanent ban.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">5. Refund Policy</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>No refunds unless the event is canceled by the admin.</li>
              <li>In case of technical issues, re-matches may be scheduled.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">6. Admin Rights</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Winnova reserves the right to change rules, reschedule matches, or disqualify players if needed.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">7. Disclaimer</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>We are not affiliated with BGMI, Free Fire, COC, or any other official game.</li>
              <li>Tournaments are conducted independently for community engagement.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
