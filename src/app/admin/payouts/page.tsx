import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Payouts Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. Soon you will be able to track and manage prize payouts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>The functionality to manage payouts, including UPI IDs, payment status, and payout screenshots, will be available shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
