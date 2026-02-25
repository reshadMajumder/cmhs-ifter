import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

import Loader from '@/components/loader';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MatrixRain from '@/components/matrix-rain';
import { ScrollWrapper } from '@/components/scroll-wrapper';

import Hero from './_components/hero';
import MarqueeNotice from './_components/marquee-notice';
import Notice from './_components/notice';
import Stats from './_components/stats';
import OurStory from './_components/our-story';
import Pricing from './_components/pricing';
import Instructions from './_components/instructions';
import PersonalizedContent from './_components/personalized-content';
import Venue from './_components/venue';
import Sponsors from './_components/sponsors';
import Donations from './_components/donations';
import GiftsOfMemory from './_components/gifts-of-memory';
import ContactSection from './_components/contact-section';

export default function Home() {
  const parallaxImage = PlaceHolderImages.find(p => p.id === 'parallax-bg');

  return (
    <>
      <Loader />
      <div className="relative z-10 bg-background">
        <Header />
        <main>
          <Hero />
          <div className="relative z-10 bg-background">
            <MarqueeNotice />
            <div className="relative min-h-screen">
              {parallaxImage && (
                <div className="sticky top-0 h-screen w-full -z-10 overflow-hidden">
                  <Image
                    src={parallaxImage.imageUrl}
                    alt={parallaxImage.description}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-background/40"></div>
                </div>
              )}
              <div className={cn("relative z-10", parallaxImage ? "-mt-[100vh]" : "")}>
                <ScrollWrapper>
                  <Notice />
                </ScrollWrapper>
                <ScrollWrapper>
                  <Stats />
                </ScrollWrapper>
                <ScrollWrapper>
                  <OurStory />
                </ScrollWrapper>
                <ScrollWrapper>
                  <Pricing />
                </ScrollWrapper>
                <ScrollWrapper>
                  <Instructions />
                </ScrollWrapper>
                {/* <PersonalizedContent />
                <GiftsOfMemory /> */}
                <ScrollWrapper>
                  <Venue />
                </ScrollWrapper>
                <ScrollWrapper>
                  <Donations />
                </ScrollWrapper>
                <ScrollWrapper>
                  <Sponsors />
                </ScrollWrapper>
                <ScrollWrapper>
                  <ContactSection />
                </ScrollWrapper>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <MatrixRain />
    </>
  );
}
