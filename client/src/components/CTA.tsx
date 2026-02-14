import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTA() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      className="relative py-24 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 text-center overflow-hidden shadow-[0_20px_50px_rgba(196,30,58,0.15)] ring-1 ring-primary/5"
        >
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary/20" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0 }}
            className="inline-flex items-center gap-2 flex-wrap px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6"
          >
            <span className="relative flex flex-wrap h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span data-testid="text-cta-badge">Let's Connect</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            data-testid="heading-cta"
          >
            Let's Build Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Digital Success Story
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.05 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            data-testid="text-cta-description"
          >
            Partner with a team that delivers results. From web development to marketing, 
            we help businesses grow with proven strategies and dedicated support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
          >
            <a href="https://calendly.com/metaedgecreatives-info/30min" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                data-testid="button-schedule-call"
                className="hover-elevate active-elevate-2 min-w-[180px]"
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  Book a Free Consultation
                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                </span>
              </Button>
            </a>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="hover-elevate active-elevate-2 min-w-[180px] bg-white/50 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                data-testid="button-contact-us"
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  Contact Us
                  <MessageSquare className="w-5 h-5 flex-shrink-0" />
                </span>
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0 }}
            className="mt-10 flex items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground flex-wrap"
          >
            <span className="flex items-center gap-2 flex-wrap" data-testid="text-cta-feature-1">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Trusted by 220+ Businesses
            </span>
            <span className="flex items-center gap-2 flex-wrap" data-testid="text-cta-feature-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              90% Client Satisfaction
            </span>
            <span className="flex items-center gap-2 flex-wrap" data-testid="text-cta-feature-3">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              252+ Projects Delivered
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
