import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";

const donations = [
    { name: 'Anisul Islam', batch: '2002', amount: 10000, isFeatured: true },
    { name: 'Jankar Mahbub', batch: '2000', amount: 7500, isFeatured: false },
    { name: 'Sumit Saha', batch: '2005', amount: 5000, isFeatured: false },
    { name: 'Jhankar Mahbub', batch: '2001', amount: 8000, isFeatured: false },
    { name: 'Hasin Hayder', batch: '1999', amount: 12000, isFeatured: true },
    { name: 'Rasel Ahmed', batch: '2003', amount: 4000, isFeatured: false },
    { name: 'HM Nayeem', batch: '2010', amount: 6000, isFeatured: false },
    { name: 'Mizanur Rahman', batch: '2008', amount: 7000, isFeatured: false },
    { name: 'Suhag Al Amin', batch: '2012', amount: 3000, isFeatured: false },
    { name: 'Andrean Chowdhury', batch: '2015', amount: 9000, isFeatured: false },
    { name: 'Fayez Ahmed', batch: '2006', amount: 5500, isFeatured: false },
    { name: 'Rakibalom', batch: '2009', amount: 4500, isFeatured: false },
    { name: 'Shorif uddin', batch: '2011', amount: 6500, isFeatured: false },
    { name: 'Mezbaul Abedin', batch: '2004', amount: 8500, isFeatured: false },
    { name: 'Mir Hussain', batch: '2007', amount: 9500, isFeatured: false },
    { name: 'Ashraful Islam', batch: '2013', amount: 3500, isFeatured: false },
].sort((a, b) => b.amount - a.amount);

export default function DonorsList() {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donations.map((donation) => (
                    <TableRow key={donation.name}>
                        <TableCell className="font-medium flex items-center gap-2">
                            {donation.name}
                            {donation.isFeatured && <Badge variant="default" className="bg-amber-500 text-white">Top Donor</Badge>}
                        </TableCell>
                        <TableCell>{donation.batch}</TableCell>
                        <TableCell className="text-right font-semibold">{donation.amount.toLocaleString()}tk</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
