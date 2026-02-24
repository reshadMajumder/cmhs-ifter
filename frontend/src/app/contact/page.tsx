
import Header from "@/components/header";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline">Contact Us</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Get in Touch</CardTitle>
                                <CardDescription>Fill out the form and our team will get back to you within 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ContactForm />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold font-headline">Contact Information</h3>
                        <p className="text-muted-foreground">
                            You can also reach us directly through the following channels. We look forward to connecting with you!
                        </p>
                        <div className="space-y-4">
                             <div className="flex items-start gap-4">
                                <Mail className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Email</h4>
                                    <a href="mailto:rbmbreunion2026@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                                        rbmbreunion2026@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold">Phone</h4>
                                    <a href="tel:01610498000" className="text-muted-foreground hover:text-primary transition-colors">
                                        01610498000
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
