
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const pricingTiers = [
  {
    title: 'Senior RBMBIAN',
    batch: 'Batch 1989 - 2016',
    price: 1530,
    fee: 30,
    features: ['Gifts of Memory', 'Raffle Draw Entry', 'Full Food Coupon', 'Cultural Event Access', 'Exclusive Alumni Kit'],
    icon: <Star className="h-8 w-8 text-amber-400" />,
    isFeatured: true,
    link: '/register',
  },
  {
    title: 'Junior RBMBIAN',
    batch: 'Batch 2017 - 2026',
    price: 1020,
    fee: 20,
    features: ['Gifts of Memory', 'Raffle Draw Entry', 'Full Food Coupon', 'Cultural Event Access', 'Standard Alumni Kit'],
    icon: <Shield className="h-8 w-8 text-primary" />,
    isFeatured: false,
    link: '/register',
  },
  {
    title: 'Guest',
    batch: 'Accompanying an alumnus',
    price: 820,
    fee: 20,
    features: ['Access with Alumnus', 'Raffle Draw Entry', 'Full Food Coupon', 'Cultural Event Access', 'Photo Booth Access'],
    icon: <Users className="h-8 w-8 text-accent" />,
    isFeatured: false,
    link: '/register/guest',
  },
];

export default function Pricing() {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline">Registration Tiers</h2>
          <p className="text-lg text-muted-foreground mt-2">Choose your pass to this unforgettable event.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={cn('flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-300', tier.isFeatured && 'border-accent border-2 -translate-y-4 shadow-purple-200')}>
              <CardHeader className="items-center text-center">
                <div className="mb-4">{tier.icon}</div>
                <CardTitle className="font-headline text-2xl">{tier.title}</CardTitle>
                <CardDescription className="text-sm">{tier.batch}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">{tier.price}tk</span>
                  <span className="text-muted-foreground">/person</span>
                   <p className="text-xs text-muted-foreground mt-1">(Includes {tier.fee}tk processing fee)</p>
                </div>
                <ul className="space-y-3 text-sm">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={cn("h-2 w-2 rounded-full", tier.isFeatured ? "bg-accent" : "bg-primary")}></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className={cn("w-full", tier.isFeatured ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
                   <Link href={tier.link}>
                        Register as {tier.title}
                   </Link>
                </Button>


                {/* registration closed message btn || if open then uncomment avobe and comment this bellow */}
                {/* <Button disabled className="w-full cursor-not-allowed">
                  Registration Closed
                </Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
