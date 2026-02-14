import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { nameToSlugMap } from "@/data/platforms";
import {
  Code,
  Search,
  Megaphone,
  Sparkles,
  Zap,
  Database,
  Smartphone,
  Layers,
  Palette,
  Video,
  Settings,
  BarChart3,
} from "lucide-react";

const mainServices = [
  {
    id: "01",
    icon: Code,
    title: "Web Development",
    description: "Custom web solutions from simple websites to complex applications. We build fast, secure, and scalable digital experiences using modern technologies.",
    points: [
      "Custom website & web application development",
      "E-commerce platforms (Shopify, WooCommerce, Magento)",
      "Content management systems (WordPress, custom CMS)",
      "Cloud hosting & deployment on AWS"
    ],
    subcategories: [
      {
        label: "Tech Stack",
        techs: ["Node.js", "Laravel", "PHP", "WordPress", "Shopify", "Magento", "Wix", "HTML5", "AWS"]
      }
    ],
    badge: "Enterprise Ready",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "02",
    icon: Database,
    title: "Custom CRM",
    description: "Build tailored CRM solutions that fit your business perfectly. We develop custom CRM systems with advanced features, integrations, and automation to streamline your operations.",
    points: [
      "Custom CRM design & development",
      "CRM migration & data transfer",
      "Third-party API integrations",
      "Custom reporting & dashboards"
    ],
    subcategories: [
      {
        label: "Platforms",
        techs: ["Salesforce", "HubSpot", "Zoho", "Microsoft Dynamics", "Pipedrive"]
      }
    ],
    badge: "Custom Solutions",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "03",
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications that deliver exceptional user experiences. From concept to deployment on iOS and Android.",
    points: [
      "iOS & Android app development",
      "Cross-platform development (Flutter, React Native)",
      "UI/UX design & prototyping",
      "App store submission & optimization"
    ],
    subcategories: [
      {
        label: "Tech Stack",
        techs: ["Flutter", "React Native", "Swift", "Kotlin", "Android Studio", "Figma"]
      }
    ],
    badge: "Cross-Platform",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "04",
    icon: Zap,
    title: "AI Automations",
    description: "Streamline your business operations with intelligent CRM automation. We integrate and optimize tools to automate workflows, manage leads, and boost productivity.",
    points: [
      "CRM setup & configuration",
      "Workflow automation & integration",
      "Lead nurturing & sales pipeline automation",
      "Multi-platform integrations (1000+ apps)"
    ],
    subcategories: [
      {
        label: "Platforms",
        techs: ["GoHighLevel", "Zapier", "n8n", "Salesforce", "HubSpot"]
      }
    ],
    badge: "Efficiency First",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "05",
    icon: Search,
    title: "SEO and GEO",
    description: "Data-driven SEO strategies that improve your rankings and drive organic traffic. We optimize every aspect of your online presence to help you get found by customers.",
    points: [
      "Technical SEO optimization",
      "On-page SEO (content, meta tags, internal linking)",
      "Off-page SEO (link building, citations)",
      "Keyword research & competitor analysis"
    ],
    subcategories: [
      {
        label: "Tools & Expertise",
        techs: ["Ahrefs", "SEMrush", "Technical SEO", "On-Page SEO", "Off-Page SEO"]
      }
    ],
    badge: "Scale Rapidly",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "06",
    icon: Megaphone,
    title: "Digital Marketing",
    description: "High-performing advertising campaigns that deliver measurable ROI. We create and manage targeted ad campaigns across Google, Facebook, and Instagram to grow your business.",
    points: [
      "Google Ads management (Search, Display, Shopping)",
      "Facebook & Instagram advertising campaigns",
      "Ad strategy, targeting & optimization",
      "Conversion tracking & performance reporting"
    ],
    subcategories: [
      {
        label: "Advertising Platforms",
        techs: ["Google Ads", "Facebook Ads", "Instagram Ads", "YouTube Ads"]
      }
    ],
    badge: "High ROI",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "07",
    icon: Palette,
    title: "Graphic Design",
    description: "Stunning visual designs that make your brand stand out. From logos to marketing materials, we create designs that captivate and communicate.",
    points: [
      "Logo design & brand identity",
      "Marketing collateral (brochures, flyers)",
      "Social media graphics & templates",
      "Presentation design"
    ],
    subcategories: [
      {
        label: "Tools",
        techs: ["Photoshop", "Illustrator", "InDesign", "Figma", "Canva"]
      }
    ],
    badge: "Visual Excellence",
    color: "from-primary/10 to-primary/5",
  },
  {
    id: "08",
    icon: Video,
    title: "Video Editing",
    description: "Professional video editing that tells your story. From corporate videos to social media content, we create engaging videos that captivate your audience.",
    points: [
      "Corporate & promotional videos",
      "Social media video content",
      "Motion graphics & animations",
      "Color grading & audio enhancement"
    ],
    subcategories: [
      {
        label: "Tools",
        techs: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Filmora", "CapCut"]
      }
    ],
    badge: "Creative Excellence",
    color: "from-primary/10 to-primary/5",
  }
];

interface ServiceCardProps {
  service: typeof mainServices[0];
  isLarge?: boolean;
  delay: number;
  isInView: boolean;
}

function ServiceCard({ service, isLarge = false, delay, isInView }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 60;
    const rotateY = (centerX - x) / 60;

    setSpotlightPos({ x, y });
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  if (isLarge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay }}
        className="h-full"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          className="group relative p-8 md:p-12 rounded-2xl bg-white border border-gray-200 overflow-hidden transition-all duration-300 ease-out h-full shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(650px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(196, 30, 58, 0.1), transparent 80%)`,
            }}
          />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <span className="text-4xl font-bold text-primary/60">{service.id}</span>
              <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {service.badge}
              </div>
            </div>

            <div 
              className="p-4 rounded-2xl bg-white w-fit mb-6 shadow-sm transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(350_78%_42%/0.3)]"
              style={{ transform: 'translateZ(20px)' }}
            >
              <service.icon 
                className="w-8 h-8 text-primary transition-transform duration-500 group-hover:rotate-12" 
              />
            </div>

            <h3 className="text-3xl font-bold text-foreground mb-4">{service.title}</h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {service.description}
            </p>

            {service.points && (
              <ul className="space-y-4 mb-8">
                {service.points.map(point => (
                  <li key={point} className="flex items-center gap-3 text-foreground/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {service.subcategories && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                {service.subcategories.map(cat => (
                  <div key={cat.label} className="space-y-3 mb-4 last:mb-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.techs.map(t => {
                        const slug = nameToSlugMap[t] || nameToSlugMap[t.toLowerCase()];
                        return slug ? (
                          <Link key={t} href={`/platforms/${slug}`}>
                            <span className="text-[10px] font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">{t}</span>
                          </Link>
                        ) : (
                          <span key={t} className="text-[10px] font-medium text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">{t}</span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="group relative p-8 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col h-full overflow-hidden transition-all duration-300 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(450px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(196, 30, 58, 0.1), transparent 80%)`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <span className="text-2xl font-bold text-primary/60">{service.id}</span>
            <div 
              className="p-3 rounded-xl bg-primary/5 w-fit transition-all duration-300 group-hover:shadow-[0_0_15px_hsl(350_78%_42%/0.35)] group-hover:bg-primary/10"
              style={{ transform: 'translateZ(15px)' }}
            >
              <service.icon className="w-6 h-6 text-primary transition-transform duration-500 group-hover:rotate-12" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
            {service.description}
          </p>

          {service.points && (
            <ul className="space-y-3 mb-6">
              {service.points.map(point => (
                <li key={point} className="flex items-center gap-2 text-xs text-foreground/70">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          {service.subcategories && (
            <div className="pt-4 border-t border-gray-50">
              {service.subcategories.map(cat => (
                <div key={cat.label} className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.techs.map(t => {
                      const slug = nameToSlugMap[t] || nameToSlugMap[t.toLowerCase()];
                      return slug ? (
                        <Link key={t} href={`/platforms/${slug}`}>
                          <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/10 transition-colors">{t}</span>
                        </Link>
                      ) : (
                        <span key={t} className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">{t}</span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={containerRef} className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
          >
            OUR SERVICES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground"
          >
            Creative Growth Solutions for{" "}
            <span className="text-primary">Modern Businesses</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="mt-6 text-muted-foreground text-lg max-w-3xl mx-auto"
          >
            Empowering your brand with high-impact strategies. We Innovate through technology, 
            Create through design, and Elevate through data-driven results.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-stretch">
          {mainServices.slice(0, 2).map((service, idx) => (
            <ServiceCard
              key={service.id}
              service={service}
              isLarge={true}
              delay={0.15 + idx * 0.05}
              isInView={isInView}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainServices.slice(2, 5).map((service, idx) => (
            <ServiceCard
              key={service.id}
              service={service}
              isLarge={false}
              delay={0.25 + idx * 0.05}
              isInView={isInView}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Link href="/services">
            <button 
              className="text-primary font-bold hover:opacity-80 transition-all duration-300 underline underline-offset-8 decoration-2 flex items-center gap-2"
              data-testid="button-view-all-services-link"
            >
              View All Services
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
