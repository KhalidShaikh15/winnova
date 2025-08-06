
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicyPage() {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">1. General Policy</h3>
            <p>
              Entry fees for tournaments are generally non-refundable. We encourage you to be certain of your participation before registering for any match.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">2. Tournament Cancellation</h3>
            <p>
              In the unlikely event that a tournament is canceled by Winnova, all registered players will receive a full refund of their entry fee. This credit can be used for future tournaments or withdrawn according to our wallet policy.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">3. Disqualification</h3>
            <p>
              Players who are disqualified for violating our Terms of Service, including rules against cheating or harassment, are not eligible for a refund of their entry fee.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">4. Technical Issues</h3>
            <p>
              We are not responsible for technical issues on the player's end, such as poor internet connection or device malfunction. Entry fees will not be refunded in these cases. If there are server-wide technical issues on our end that significantly impact the integrity of the match, we may, at our discretion, offer a full or partial refund.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">5. How to Request a Refund</h3>
            <p>
              If you believe you are eligible for a refund based on the criteria above, please contact our support team through the Contact Us page with your registration details and a clear explanation of the issue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
