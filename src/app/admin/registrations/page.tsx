'use client'
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { type Registration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            const regsCollection = collection(firestore, 'registrations');
            const q = query(regsCollection, orderBy('created_at', 'desc'));
            const regsSnapshot = await getDocs(q);
            const regsList = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[];
            
            // This is inefficient in a real app, should be a cloud function or denormalized
            // For now, we fetch tournament titles one by one.
            const regsWithTitles = await Promise.all(regsList.map(async (reg) => {
                // In a real app, you would get this from a denormalized field on the registration doc
                return { ...reg, tournament_title: reg.tournament_id };
            }));

            setRegistrations(regsWithTitles);
            setLoading(false);
        };
        fetchRegistrations();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">All Registrations</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>Squad Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>User UPI ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading registrations...</TableCell>
                                </TableRow>
                            ) : registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No registrations found.</TableCell>
                                </TableRow>
                            ) : (
                                registrations.map(reg => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">{reg.tournament_title}</TableCell>
                                        <TableCell>{reg.squad_name}</TableCell>
                                        <TableCell>{format(reg.created_at.toDate(), 'PPP')}</TableCell>
                                        <TableCell>
                                            <Badge variant={reg.status === 'pending' ? 'secondary' : reg.status === 'confirmed' ? 'default' : 'destructive'}>
                                                {reg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs">{reg.user_upi_id || 'N/A'}</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
