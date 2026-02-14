import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import pageBg from "@/assets/bg-faqs.webp";
import { usePageMeta } from "@/hooks/use-page-meta";
import AnimatedCounter from "@/components/AnimatedCounter";

function FAQItem({ faq, index, isOpen, onToggle }: { 
  faq: { question: string; answer: string }; 
  index: number; 
  isOpen: boolean; 
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover-elevate transition-all duration-300"
        data-testid={`faq-toggle-${index}`}
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-primary/20 min-w-[2rem]">
            {String(index + 1).padStart(2, '0')}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pl-14">
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQs() {
  usePageMeta("faqs");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  const { data: faqs = [], isLoading } = useQuery<{ id: string; question: string; answer: string }[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const res = await fetch("/api/faqs");
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      return res.json();
    },
  });

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${pageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.35,
        }}
      />
      <div className="relative z-[1]">
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Got Questions?</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Frequently Asked
                <span className="text-primary block">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Find answers to common questions about our services, process, and how we can help your business grow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-contact-us">
                    Still Have Questions?
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-2xl transform rotate-3" />
                <div ref={statsRef} className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-primary/5 rounded-2xl">
                      <div className="text-3xl font-bold text-primary mb-1">
                        <AnimatedCounter value={faqs.length || 6} inView={statsInView} />
                      </div>
                      <div className="text-sm text-muted-foreground">Common Questions</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-2xl">
                      <div className="text-3xl font-bold text-primary mb-1">
                        24/7
                      </div>
                      <div className="text-sm text-muted-foreground">Support Available</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-2xl">
                      <div className="text-3xl font-bold text-primary mb-1">
                        <AnimatedCounter value={100} suffix="%" inView={statsInView} />
                      </div>
                      <div className="text-sm text-muted-foreground">Transparency</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-2xl">
                      <div className="text-3xl font-bold text-primary mb-1">
                        <AnimatedCounter value={1} suffix="hr" prefix="<" inView={statsInView} />
                      </div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've compiled answers to the most common questions our clients ask.
            </p>
          </motion.div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No FAQs available at the moment.
              </div>
            ) : (
              faqs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div 
              className="inline-block p-8 rounded-3xl bg-white shadow-xl border border-gray-100"
              style={{
                boxShadow: '0 25px 80px -20px hsl(350 78% 42% / 0.25)'
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Our team is here to help. Reach out and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-cta-contact">
                    Contact Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      </div>
    </div>
  );
}
