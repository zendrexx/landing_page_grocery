import { SiteNav } from "@/components/site/SiteNav";
import { Hero } from "@/components/hero/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Family } from "@/components/sections/Family";
import { Prices } from "@/components/sections/Prices";
import { Founder } from "@/components/sections/Founder";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { GetAccess } from "@/components/sections/GetAccess";
import { Footer } from "@/components/sections/Footer";

/**
 * The full Zebite page, on Zhevion's own stack. Hero/nav/cursor match
 * Zhevion's real implementation closely; the sections below carry
 * Zebite's own content, rebuilt in the same design language (paper/ink,
 * eyebrow labels, pill/card radii, Reveal-based entrances) rather than
 * copied 1:1 from a Zhevion section, since Zhevion doesn't have
 * equivalents for a product page's pricing/FAQ/family-plan content.
 */
export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Family />
        <Prices />
        <Founder />
        <Testimonials />
        <Pricing />
        <Faq />
        <GetAccess />
      </main>
      <Footer />
    </>
  );
}
