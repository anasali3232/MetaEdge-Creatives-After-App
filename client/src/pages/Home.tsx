import Hero from "@/components/Hero";
import CompanyLogos from "@/components/CompanyLogos";
import LazySection from "@/components/LazySection";
import { lazy, Suspense } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";

const About = lazy(() => import("@/components/About"));
const TechStack = lazy(() => import("@/components/TechStack"));
const Stats = lazy(() => import("@/components/Stats"));
const Services = lazy(() => import("@/components/Services"));
const HomeTestimonials = lazy(() => import("@/components/HomeTestimonials"));
const CTA = lazy(() => import("@/components/CTA"));

export default function Home() {
  usePageMeta("home");
  return (
    <div className="relative">
      <main className="relative z-[1]">
        <Hero />
        <CompanyLogos />
        <LazySection rootMargin="300px" minHeight="400px">
          <Suspense fallback={null}>
            <About />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="300px" minHeight="300px">
          <Suspense fallback={null}>
            <TechStack />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="300px" minHeight="300px">
          <Suspense fallback={null}>
            <Stats />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="300px" minHeight="600px">
          <Suspense fallback={null}>
            <Services />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="300px" minHeight="400px">
          <Suspense fallback={null}>
            <HomeTestimonials />
          </Suspense>
        </LazySection>
        <LazySection rootMargin="300px" minHeight="300px">
          <Suspense fallback={null}>
            <CTA />
          </Suspense>
        </LazySection>
      </main>
    </div>
  );
}
