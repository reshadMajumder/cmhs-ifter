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
                <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 max-w-5xl mx-auto overflow-hidden border-none sm:border">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left Side: Form */}
                        <div className="p-8 md:p-12">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold font-headline mb-2">Send us a Message</h3>
                                <p className="text-muted-foreground text-sm">Our team will get back to you within 24 hours.</p>
                            </div>
                            <ContactForm />
                        </div>

                        {/* Right Side: Info */}
                        <div className="p-8 md:p-12 bg-accent/5 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold font-headline mb-2">Contact Information</h3>
                                <p className="text-muted-foreground text-sm">
                                    You can also reach us directly through the following channels.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4 group">
                                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Email</h4>
                                        <a href="mailto:excmhsian@gmail.com" className="text-muted-foreground hover:text-primary transition-colors block">
                                            excmhsian@gmail.com

                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Phone</h4>
                                        <a href="tel:+8801627076527" className="text-muted-foreground hover:text-primary transition-colors block">
                                            +8801627076527
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-border/50">
                                <p className="text-accent font-bold italic">
                                    We look forward to connecting with you!
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
}
