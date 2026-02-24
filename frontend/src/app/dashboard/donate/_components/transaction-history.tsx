'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface Payment {
  id: number;
  phone: string;
  transaction_id: string;
  amount: string;
  payment_type: string;
  method: string;
  payment_approved: boolean;
  created_at: string;
  user: number;
}

export default function TransactionHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/payment/get-create/`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment history.');
        }
        const data = await response.json();
        setPayments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (payments.length === 0) {
    return <p className="text-muted-foreground text-center">You have not made any payments yet.</p>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="capitalize">{payment.payment_type}</TableCell>
              <TableCell className="font-mono text-xs">{payment.transaction_id}</TableCell>
              <TableCell className="capitalize">{payment.method}</TableCell>
              <TableCell>
                <Badge
                  variant={payment.payment_approved ? 'default' : 'secondary'}
                  className={cn(payment.payment_approved ? 'bg-green-600' : 'bg-yellow-500', 'text-white')}
                >
                  {payment.payment_approved ? 'Approved' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">{Number(payment.amount).toLocaleString()}tk</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
