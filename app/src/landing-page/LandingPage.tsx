import { features, faqs, footerNavigation, testimonials } from './contentSections';
import Hero from './components/Hero';
import Clients from './components/Clients';
import Features from './components/Features';
import Modules from './components/Modules';
import HowItWorks from './components/HowItWorks';
import UseCases from './components/UseCases';
import DemoSection from './components/DemoSection';
import TrustBadges from './components/TrustBadges';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DarkModeToggle from './components/DarkModeToggle';
import SEOMetadata from './components/SEOMetadata';

export default function LandingPage() {
  return (
    <div className='bg-white dark:text-white dark:bg-gray-900'>
      <SEOMetadata />
      <main className='isolate dark:bg-gray-900'>
        <Hero />
        <Clients />
        <Features features={features} />
        <Modules />
        <UseCases />
        <HowItWorks />
        <DemoSection />
        <TrustBadges />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
      <DarkModeToggle />
    </div>
  );
}
