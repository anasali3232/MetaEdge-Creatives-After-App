import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import CTA from "@/components/CTA";
import pageBg from "@/assets/bg-testimonials.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

function TestimonialCard({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.2, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-8 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out hover:-translate-y-2 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.12), transparent 40%)`
            : "none",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const testimonials = [
  {
    name: "James Richardson",
    title: "CEO",
    company: "TechVista Solutions",
    service: "Web Development",
    quote:
      "MetaEdge Creatives transformed our outdated website into a modern, high-performing platform that increased our lead generation by 200%. Their technical expertise and attention to detail exceeded all expectations. The team delivered on time and the results speak for themselves.",
  },
  {
    name: "Sarah Mitchell",
    title: "Marketing Director",
    company: "BlueOak Digital",
    service: "Digital Marketing",
    quote:
      "Our digital marketing campaigns have never performed better since partnering with MetaEdge Creatives. They developed a data-driven strategy that doubled our ROI within three months. Their team truly understands the nuances of modern digital advertising.",
  },
  {
    name: "Michael Thompson",
    title: "Founder",
    company: "GreenLeaf Commerce",
    service: "E-Commerce & CRM",
    quote:
      "The custom CRM and e-commerce solution MetaEdge built for us streamlined our entire sales pipeline. We saw a 40% increase in customer retention and our order processing time was cut in half. An absolutely game-changing partnership.",
  },
  {
    name: "Emily Chen",
    title: "VP of Operations",
    company: "NovaStar Inc",
    service: "AI Automations",
    quote:
      "MetaEdge implemented AI-powered automations that saved our team over 30 hours per week on repetitive tasks. Their innovative approach to workflow optimization has been instrumental in scaling our operations efficiently.",
  },
  {
    name: "David Anderson",
    title: "Owner",
    company: "Summit Real Estate Group",
    service: "SEO and GEO",
    quote:
      "Within six months of working with MetaEdge, our organic search traffic increased by 180% and we ranked on the first page for all our target keywords. Their SEO strategies are thorough, transparent, and results-oriented.",
  },
  {
    name: "Jennifer Parker",
    title: "CMO",
    company: "CloudPeak Software",
    service: "Full-Service Partnership",
    quote:
      "Working with MetaEdge Creatives has been one of the best decisions for our brand. From strategy to execution, they handle every aspect of our digital presence with professionalism and creativity. They feel like an extension of our own team.",
  },
  {
    name: "Robert Williams",
    title: "Director",
    company: "Pacific Coast Media",
    service: "Video Editing",
    quote:
      "The video content MetaEdge produced for our campaigns was nothing short of cinematic. Their editing team brought our brand story to life with compelling visuals and seamless post-production. Engagement on our video content tripled.",
  },
  {
    name: "Amanda Foster",
    title: "Co-founder",
    company: "BrightPath Analytics",
    service: "Graphic Design",
    quote:
      "MetaEdge completely revamped our brand identity with stunning graphic design work. From our logo to marketing collateral, every piece is cohesive, modern, and perfectly aligned with our brand values. We consistently receive compliments on our visual identity.",
  },
  {
    name: "Christopher Hayes",
    title: "CTO",
    company: "DataForge Systems",
    service: "Mobile App Development",
    quote:
      "MetaEdge developed a cross-platform mobile application for us that our users love. The app is fast, intuitive, and has maintained a 4.8-star rating on both app stores. Their development process was agile, communicative, and highly efficient.",
  },
  {
    name: "Lauren Martinez",
    title: "Brand Manager",
    company: "Coastal Living Co",
    service: "Digital Marketing",
    quote:
      "Our digital marketing presence has grown exponentially since MetaEdge took over our campaigns. They crafted a strategy that resonated with our audience and grew our reach by 300% in under a year. Their creativity and consistency are unmatched.",
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-1" data-testid="rating-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  usePageMeta("testimonials");
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative pt-20" ref={containerRef}>
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
      <section className="relative py-24 overflow-hidden" data-testid="section-testimonials-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6"
              data-testid="text-testimonials-badge"
            >
              Testimonials
            </motion.span>
            <h1
              className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
              data-testid="heading-testimonials"
            >
              Client{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Testimonials
              </span>
            </h1>
            <p
              className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              data-testid="text-testimonials-description"
            >
              Hear from the businesses we have helped grow. Our clients' success stories reflect our commitment to delivering exceptional digital solutions and measurable results.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 overflow-hidden" data-testid="section-testimonials-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} delay={0.1 + i * 0.08}>
                <div className="flex items-center justify-between mb-4 gap-2">
                  <StarRating />
                  <Quote className="w-8 h-8 text-primary/15 group-hover:text-primary/25 transition-colors" />
                </div>
                <p
                  className="text-muted-foreground leading-relaxed mb-6 text-sm"
                  data-testid={`text-testimonial-quote-${i}`}
                >
                  "{t.quote}"
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="font-bold text-foreground group-hover:text-primary transition-colors"
                    data-testid={`text-testimonial-name-${i}`}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid={`text-testimonial-role-${i}`}
                  >
                    {t.title} at {t.company}
                  </p>
                  <span
                    className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
                    data-testid={`tag-testimonial-service-${i}`}
                  >
                    {t.service}
                  </span>
                </div>
              </TestimonialCard>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      </div>
    </div>
  );
}
