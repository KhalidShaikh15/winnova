'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminRegistrationsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">All Registrations</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Page Removed</CardTitle>
                    <CardDescription>
                        This page is no longer needed. Registrations can now be viewed
                        by clicking the &quot;Manage&quot; button on a specific tournament
                        from the <Link href="/admin" className="underline">main admin dashboard</Link>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This keeps all related information in one place!</p>
                </CardContent>
            </Card>
        </div>
    );
}
