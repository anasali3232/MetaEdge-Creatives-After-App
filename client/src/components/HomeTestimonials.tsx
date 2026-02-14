import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const testimonials = [
  {
    name: "James Richardson",
    role: "CEO",
    company: "TechVista Solutions",
    quote: "MetaEdge transformed our online presence completely. Their web development team built a platform that increased our conversions by 200%.",
  },
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "BlueOak Digital",
    quote: "The digital marketing strategies they implemented doubled our lead generation within three months. Outstanding ROI.",
  },
  {
    name: "Emily Chen",
    role: "VP of Operations",
    company: "NovaStar Inc",
    quote: "Their AI automation solutions saved us over 30 hours per week. The workflows they built are incredibly efficient.",
  },
  {
    name: "David Anderson",
    role: "Owner",
    company: "Summit Real Estate Group",
    quote: "Our organic traffic grew by 350% after their SEO and GEO optimization. Best investment we've made.",
  },
  {
    name: "Christopher Hayes",
    role: "CTO",
    company: "DataForge Systems",
    quote: "The mobile app they developed for us received a 4.8 rating on both app stores. Exceptional quality.",
  },
  {
    name: "Amanda Foster",
    role: "Co-founder",
    company: "BrightPath Analytics",
    quote: "Their graphic design work elevated our brand identity to a whole new level. Professional and creative.",
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

export default function HomeTestimonials() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-24 overflow-hidden"
      data-testid="section-home-testimonials"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0 }}
            data-testid="text-badge-testimonials"
          >
            Testimonials
          </motion.span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            data-testid="heading-home-testimonials"
          >
            What Our Clients{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Say
            </span>
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-home-testimonials-description"
          >
            Hear from the businesses we have helped grow with our digital solutions and dedicated support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: 0.05 + i * 0.05 }}
              className="group relative p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300"
              data-testid={`card-testimonial-${i}`}
            >
              <div className="mb-4">
                <StarRating />
              </div>
              <p
                className="text-muted-foreground leading-relaxed mb-6 text-sm"
                data-testid={`text-testimonial-quote-${i}`}
              >
                "{t.quote}"
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p
                  className="font-bold text-foreground"
                  data-testid={`text-testimonial-name-${i}`}
                >
                  {t.name}
                </p>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid={`text-testimonial-role-${i}`}
                >
                  {t.role}, {t.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="text-center mt-12"
        >
          <Link href="/about/testimonials">
            <Button
              variant="outline"
              size="lg"
              className="hover-elevate active-elevate-2"
              data-testid="link-view-all-testimonials"
            >
              View All Testimonials
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
