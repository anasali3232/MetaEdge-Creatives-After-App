import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Code, 
  Globe, 
  ShoppingCart, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Server,
  Shield,
  Zap,
  Layers,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SiReact, SiNodedotjs, SiPhp, SiWordpress, SiShopify, SiWix, SiHtml5, SiLaravel, SiMagento, SiAmazon } from "react-icons/si";
import { nameToSlugMap } from "@/data/platforms";
import AnimatedCounter from "@/components/AnimatedCounter";
import CTA from "@/components/CTA";
import ServicePortfolio from "@/components/ServicePortfolio";
import serviceTechBg from "@/assets/bg-web-development.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

const platforms = [
  { icon: SiReact, name: "React", color: "#61DAFB", slug: "react" },
  { icon: SiNodedotjs, name: "Node.js", color: "#339933", slug: "nodejs" },
  { icon: SiPhp, name: "PHP", color: "#777BB4", slug: "php" },
  { icon: SiLaravel, name: "Laravel", color: "#FF2D20", slug: "laravel" },
  { icon: SiWordpress, name: "WordPress", color: "#21759B", slug: "wordpress" },
  { icon: SiShopify, name: "Shopify", color: "#7AB55C", slug: "shopify" },
  { icon: SiMagento, name: "Magento", color: "#EE672F", slug: "magento" },
  { icon: SiWix, name: "Wix", color: "#0C6EFC", slug: "wix" },
  { icon: SiHtml5, name: "HTML5", color: "#E34F26", slug: "html5" },
  { icon: SiAmazon, name: "AWS", color: "#FF9900", slug: "aws" },
];

const features = [
  {
    icon: Globe,
    title: "Responsive Design",
    description: "Websites that look stunning on all devices - desktop, tablet, and mobile."
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Solutions",
    description: "Complete online stores with secure payment gateways and inventory management."
  },
  {
    icon: Database,
    title: "Scalable Architecture",
    description: "Built to grow with your business using modern cloud infrastructure."
  },
  {
    icon: Shield,
    title: "Security First",
    description: "SSL certificates, secure coding practices, and regular security audits."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with fast loading times for better user experience."
  },
  {
    icon: Layers,
    title: "CMS Integration",
    description: "Easy content management with WordPress, custom CMS, or headless solutions."
  }
];

const services = [
  "Custom website development",
  "Web application development",
  "E-commerce platforms (Shopify, WooCommerce, Magento)",
  "Content management systems (WordPress, custom CMS)",
  "Progressive Web Apps (PWA)",
  "API development & integration",
  "Cloud hosting & deployment on AWS",
  "Website maintenance & support"
];

const process = [
  { step: "01", title: "Discovery", description: "Understanding your goals, audience, and requirements" },
  { step: "02", title: "Design", description: "Creating wireframes and visual designs for approval" },
  { step: "03", title: "Development", description: "Building your website with clean, efficient code" },
  { step: "04", title: "Testing", description: "Rigorous testing across devices and browsers" },
  { step: "05", title: "Launch", description: "Deploying your website and going live" },
  { step: "06", title: "Support", description: "Ongoing maintenance and updates" }
];

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-6 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      data-testid={`feature-card-${index}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: isHovered
            ? `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.04), transparent 40%)`
            : 'none',
        }}
      />
      <div className="relative z-10">
        <div className="p-3 rounded-xl bg-primary/5 w-fit mb-4 group-hover:bg-primary/10 transition-colors">
          <feature.icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function WebDevelopmentPage() {
  usePageMeta("services/web-development");
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${serviceTechBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.35,
        }}
      />
      <div className="relative z-[1]">
      <section ref={heroRef} className="relative py-24 bg-gradient-to-b from-primary/5 via-transparent to-transparent overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Code className="w-4 h-4" />
                Enterprise Ready
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Web{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Development
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Custom web solutions from simple websites to complex applications. We build fast, secure, and scalable digital experiences using modern technologies that help your business grow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-start-project">
                    Start Your Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" data-testid="button-view-services">
                    View All Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
                <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-primary text-white shadow-lg">
                  <Code className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-6">Technologies We Use</h3>
                <div className="grid grid-cols-5 gap-4">
                  {platforms.map((platform, index) => (
                    <motion.div
                      key={platform.name}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="group relative flex flex-col items-center"
                    >
                      {platform.slug ? (
                        <Link href={`/platforms/${platform.slug}`}>
                          <div 
                            className="p-3 rounded-xl bg-gray-50 hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                          >
                            <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                          </div>
                        </Link>
                      ) : (
                        <div 
                          className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-sm"
                        >
                          <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {platform.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              Our Expertise
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What We <span className="text-primary">Offer</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block">
                Services Included
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Complete Web <span className="text-primary">Solutions</span>
              </h2>
              <div className="space-y-4">
                {services.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Our Development Process</h3>
                <div className="space-y-6">
                  {process.map((item, idx) => {
                    const stepRef = useRef(null);
                    const isStepInView = useInView(stepRef, { once: true, margin: "-100px" });
                    return (
                      <motion.div
                        key={idx}
                        ref={stepRef}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">
                            <AnimatedCounter value={parseInt(item.step)} prefix="0" inView={isStepInView} />
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ServicePortfolio category="Web Development" />
      <CTA />
      </div>
    </div>
  );
}
