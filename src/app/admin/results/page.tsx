import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminResultsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Results Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. Soon you will be able to upload and manage match results here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>The functionality to add match results, including kills, position, MVP, and prize amounts, will be available shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
