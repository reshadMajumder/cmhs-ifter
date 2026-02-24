
import Header from "@/components/header";
import Footer from "@/components/footer";
import DonorsTable from "./_components/donors-table";
import { Handshake } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DonationsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
                        <Handshake className="h-10 w-10 text-accent" />
                        Our Generous Donors
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        A full list of contributions from our esteemed RBMBIANs.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Donations</CardTitle>
                        <CardDescription>
                            The list is sorted by donation amount in descending order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DonorsTable />
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
