import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ContactForm from '@/components/contact-form';

export default function ContactSection() {
    return (
        <section className="py-20">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold font-headline flex items-center justify-center gap-4">
                        <MessageSquare className="h-10 w-10 text-accent" />
                        Get In Touch
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">
                        Have questions or want to get involved? We'd love to hear from you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div>
                        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>Our team will get back to you within 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ContactForm />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6 self-center">
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
            </div>
        </section>
    );
}
