import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Code,
  Search,
  Megaphone,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
  ShoppingCart,
  Database,
  BarChart3,
  Target,
  TrendingUp,
  Palette,
  Video,
  FileText,
  Link2,
  Settings,
  Rocket,
  Award,
  Clock,
  HeadphonesIcon,
  Smartphone,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { nameToSlugMap } from "@/data/platforms";
import AnimatedCounter from "@/components/AnimatedCounter";
import CTA from "@/components/CTA";
import serviceTechBg from "@/assets/bg-custom-crm.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

const mainServices = [
  {
    id: 1,
    icon: Code,
    title: "Web Development",
    description: "Custom web solutions from simple websites to complex applications. We build fast, secure, and scalable digital experiences using modern technologies.",
    points: [
      "Custom website & web application development",
      "E-commerce platforms (Shopify, WooCommerce, Magento)",
      "Content management systems (WordPress, custom CMS)",
      "Cloud hosting & deployment on AWS"
    ],
    techs: ["Node.js", "Laravel", "PHP", "WordPress", "Shopify", "Magento", "Wix", "HTML5", "AWS"],
    badge: "Enterprise Ready",
    color: "from-primary/10 to-primary/5",
    link: "/services/web-development",
    features: [
      { icon: Globe, label: "Responsive Design" },
      { icon: ShoppingCart, label: "E-commerce" },
      { icon: Database, label: "Scalable Architecture" }
    ]
  },
  {
    id: 2,
    icon: Database,
    title: "Custom CRM",
    description: "Build tailored CRM solutions that fit your business perfectly. We develop custom CRM systems with advanced features, integrations, and automation to streamline your operations.",
    points: [
      "Custom CRM design & development",
      "CRM migration & data transfer",
      "Third-party API integrations",
      "Custom reporting & dashboards"
    ],
    techs: ["Salesforce", "HubSpot", "Zoho", "Microsoft Dynamics", "Pipedrive"],
    badge: "Custom Solutions",
    color: "from-primary/10 to-primary/5",
    link: "/services/custom-crm",
    features: [
      { icon: Database, label: "Custom Modules" },
      { icon: Settings, label: "Integrations" },
      { icon: BarChart3, label: "Dashboards" }
    ]
  },
  {
    id: 3,
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications that deliver exceptional user experiences. From concept to deployment on iOS and Android.",
    points: [
      "iOS & Android app development",
      "Cross-platform development (Flutter, React Native)",
      "UI/UX design & prototyping",
      "App store submission & optimization"
    ],
    techs: ["Flutter", "React Native", "Swift", "Kotlin", "Android Studio", "Figma"],
    badge: "Cross-Platform",
    color: "from-primary/10 to-primary/5",
    link: "/services/mobile-app-development",
    features: [
      { icon: Smartphone, label: "Native Apps" },
      { icon: Layers, label: "Cross-Platform" },
      { icon: Palette, label: "UI/UX Design" }
    ]
  },
  {
    id: 4,
    icon: Zap,
    title: "AI Automation",
    description: "Streamline your business operations with intelligent CRM automation. We integrate and optimize tools to automate workflows, manage leads, and boost productivity.",
    points: [
      "CRM setup & configuration",
      "Workflow automation & integration",
      "Lead nurturing & sales pipeline automation",
      "Multi-platform integrations (1000+ apps)"
    ],
    techs: ["GoHighLevel", "Zapier", "n8n", "Salesforce", "HubSpot"],
    badge: "Efficiency First",
    color: "from-primary/10 to-primary/5",
    link: "/services/ai-automation",
    features: [
      { icon: Settings, label: "Custom Workflows" },
      { icon: Link2, label: "Integrations" },
      { icon: TrendingUp, label: "Analytics" }
    ]
  },
  {
    id: 5,
    icon: Search,
    title: "SEO and GEO",
    description: "Data-driven SEO strategies that improve your rankings and drive organic traffic. We optimize every aspect of your online presence to help you get found by customers.",
    points: [
      "Technical SEO optimization",
      "On-page SEO (content, meta tags, internal linking)",
      "Off-page SEO (link building, citations)",
      "Keyword research & competitor analysis"
    ],
    techs: ["Ahrefs", "SEMrush", "Technical SEO", "On-Page SEO", "Off-Page SEO"],
    badge: "Scale Rapidly",
    color: "from-primary/10 to-primary/5",
    link: "/services/seo-and-geo",
    features: [
      { icon: BarChart3, label: "Ranking Reports" },
      { icon: Target, label: "Keyword Strategy" },
      { icon: FileText, label: "Content Optimization" }
    ]
  },
  {
    id: 6,
    icon: Megaphone,
    title: "Digital Marketing",
    description: "High-performing advertising campaigns that deliver measurable ROI. We create and manage targeted ad campaigns across Google, Facebook, and Instagram to grow your business.",
    points: [
      "Google Ads management (Search, Display, Shopping)",
      "Facebook & Instagram advertising campaigns",
      "Ad strategy, targeting & optimization",
      "Conversion tracking & performance reporting"
    ],
    techs: ["Google Ads", "Facebook Ads", "Instagram Ads", "YouTube Ads"],
    badge: "High ROI",
    color: "from-primary/10 to-primary/5",
    link: "/services/digital-marketing",
    features: [
      { icon: Target, label: "Precise Targeting" },
      { icon: TrendingUp, label: "Conversion Tracking" },
      { icon: BarChart3, label: "ROI Analytics" }
    ]
  },
  {
    id: 7,
    icon: Palette,
    title: "Graphic Design",
    description: "Stunning visual designs that make your brand stand out. From logos to marketing materials, we create designs that captivate and communicate.",
    points: [
      "Logo design & brand identity",
      "Marketing collateral (brochures, flyers)",
      "Social media graphics & templates",
      "Presentation design"
    ],
    techs: ["Photoshop", "Illustrator", "InDesign", "Figma", "Canva"],
    badge: "Visual Excellence",
    color: "from-primary/10 to-primary/5",
    link: "/services/graphic-design",
    features: [
      { icon: Palette, label: "Brand Identity" },
      { icon: FileText, label: "Marketing Materials" },
      { icon: Target, label: "Social Graphics" }
    ]
  },
  {
    id: 8,
    icon: Video,
    title: "Video Editing",
    description: "Professional video editing that tells your story. From corporate videos to social media content, we create engaging videos that captivate your audience.",
    points: [
      "Corporate & promotional videos",
      "Social media video content",
      "Motion graphics & animations",
      "Color grading & audio enhancement"
    ],
    techs: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Filmora", "CapCut"],
    badge: "Creative Excellence",
    color: "from-primary/10 to-primary/5",
    link: "/services/video-editing",
    features: [
      { icon: Video, label: "Professional Editing" },
      { icon: Palette, label: "Motion Graphics" },
      { icon: Target, label: "Multi-Platform" }
    ]
  }
];

const whyChooseUs = [
  {
    icon: Award,
    title: "Expert Team",
    description: "Skilled professionals with years of experience in digital marketing and web development.",
    value: 10,
    suffix: "+"
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We respect deadlines and ensure your projects are completed within the agreed timeline.",
    value: 100,
    suffix: "%"
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock assistance to address your queries and resolve issues promptly.",
    value: 24,
    suffix: "/7"
  },
  {
    icon: Rocket,
    title: "Result-Driven",
    description: "Our strategies are focused on achieving measurable results and business growth.",
    value: 500,
    suffix: "+"
  }
];

function ServiceCard({ service, index }: { service: typeof mainServices[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 150;
    const rotateY = (centerX - x) / 150;
    
    setMousePosition({ x, y });
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        className="group relative p-8 lg:p-10 rounded-3xl bg-white border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out h-full overflow-hidden flex flex-col"
        style={{ transformStyle: 'preserve-3d' }}
        data-testid={`card-service-${service.id}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
          style={{
            background: isHovered
              ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.08), transparent 40%)`
              : 'none',
          }}
        />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <span className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors duration-500">
              <AnimatedCounter value={service.id} prefix="0" inView={isInView} />
            </span>
            <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {service.badge}
            </div>
          </div>

          <div 
            className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 w-fit mb-6 transition-all duration-300 group-hover:shadow-[0_0_25px_hsl(350_78%_42%/0.35)] group-hover:from-primary/10 group-hover:to-primary/20"
            style={{ transform: 'translateZ(20px)' }}
          >
            <service.icon className="w-8 h-8 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed min-h-[4.5rem]">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {service.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm text-foreground/80" data-testid={`feature-${service.id}-${idx}`}>
                <feature.icon className="w-4 h-4 text-primary" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          <ul className="space-y-3 mb-8">
            {service.points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>

          <div className="pt-6 border-t border-gray-100 mt-auto">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Technologies & Tools</p>
            <div className="flex flex-wrap gap-2 mb-6 min-h-[2rem]">
              {service.techs.map((tech, idx) => {
                const slug = nameToSlugMap[tech];
                return slug ? (
                  <Link key={idx} href={`/platforms/${slug}`}>
                    <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-300 hover:bg-primary/10 hover:border-primary/20 cursor-pointer" data-testid={`tech-${service.id}-${idx}`}>{tech}</span>
                  </Link>
                ) : (
                  <span key={idx} className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-300 hover:bg-primary/10 hover:border-primary/20" data-testid={`tech-${service.id}-${idx}`}>{tech}</span>
                );
              })}
            </div>
            <Link href={service.link}>
              <Button className="w-full" data-testid={`button-learn-more-${service.id}`}>
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WhyChooseCard({ item, index }: { item: typeof whyChooseUs[0], index: number }) {
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
      className="group relative p-8 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out hover:-translate-y-2"
      data-testid={`card-why-${index}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: isHovered
            ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.08), transparent 40%)`
            : 'none',
        }}
      />
      <div className="relative z-10">
        <div className="p-4 rounded-2xl bg-primary/5 w-fit mb-6 transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_hsl(350_78%_42%/0.25)]">
          <item.icon className="w-8 h-8 text-primary transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="text-2xl font-bold text-primary mb-2">
          <AnimatedCounter value={item.value} suffix={item.suffix} inView={isInView} />
        </div>
        <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  usePageMeta("services");
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
      <section ref={heroRef} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/[0.02] to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              What We Offer
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Comprehensive digital solutions to help your business thrive. From stunning websites to powerful marketing strategies, we deliver results that matter.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="hover-elevate active-elevate-2" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://calendly.com/metaedgecreatives-info/30min" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="hover-elevate active-elevate-2" data-testid="button-schedule-call">
                  Schedule a Call
                </Button>
              </a>
            </div>
          </motion.div>
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
              Creative Growth Solutions for{" "}
              <span className="text-primary">Modern Businesses</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              We Innovate through technology, Create through design, and Elevate through data-driven results.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.slice(0, 2).map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {mainServices.slice(2).map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx + 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What Sets Us <span className="text-primary">Apart</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              We're not just another agency. We're your growth partners committed to delivering exceptional results.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, idx) => (
              <WhyChooseCard key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <CTA />
      </div>
    </div>
  );
}
