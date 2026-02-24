import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DonationForm from './_components/donation-form';
import TransactionHistory from './_components/transaction-history';

export default function DonatePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Support the Reunion</CardTitle>
            <CardDescription>Your contribution makes this event memorable for everyone.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonationForm />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
         <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Transaction History</CardTitle>
                <CardDescription>Your recent payments and donations.</CardDescription>
            </CardHeader>
            <CardContent>
                <TransactionHistory />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
