import { useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { 
  Target, 
  Lightbulb, 
  Users, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Handshake, 
  ArrowUpRight,
  Code,
  Zap,
  Search,
  Megaphone,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Linkedin,
  Globe,
  Instagram,
  Facebook,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedCounter from "@/components/AnimatedCounter";
import CTA from "@/components/CTA";
import pageBg from "@/assets/bg-about.webp";
import teamOfficeImg from "@/assets/about-office-new.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

function AboutCard({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
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
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.12), transparent 40%)`
            : 'none',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We deliver nothing less than exceptional quality in every project",
  },
  {
    icon: ShieldCheck,
    title: "Transparency",
    description: "Clear communication, honest timelines, and complete visibility into our process",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We embrace new technologies and creative solutions to stay ahead",
  },
  {
    icon: TrendingUp,
    title: "Results-Driven",
    description: "Data-backed decisions and measurable outcomes guide everything we do",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    description: "Your success is our success—we work as partners, not vendors",
  },
  {
    icon: Target,
    title: "Continuous Growth",
    description: "Always learning, improving, and evolving to serve you better",
  },
];

const processes = [
  {
    number: 1,
    title: "Discovery & Research",
    description: "We start by understanding your business, goals, target audience, and challenges. Deep research and analysis form the foundation of every successful project.",
  },
  {
    number: 2,
    title: "Strategy & Planning",
    description: "Based on our findings, we develop a comprehensive strategy and project roadmap. Clear timelines, milestones, and deliverables are established.",
  },
  {
    number: 3,
    title: "Design & Development",
    description: "Our team brings the strategy to life with stunning designs and robust development. We maintain constant communication and provide regular updates throughout.",
  },
  {
    number: 4,
    title: "Testing & Refinement",
    description: "Rigorous testing across devices, browsers, and scenarios ensures everything works flawlessly. We refine based on feedback and performance data.",
  },
  {
    number: 5,
    title: "Launch & Deployment",
    description: "We handle the complete launch process, from final checks to going live. Post-launch monitoring ensures a smooth transition.",
  },
  {
    number: 6,
    title: "Support & Optimization",
    description: "Our partnership continues with ongoing support, maintenance, and continuous optimization to improve results over time.",
  },
];

import wasimImg from "@/assets/team-wasim.webp";
import anasImg from "@/assets/team-anas.webp";
import mugheesImg from "@/assets/team-mughees.webp";

const fallbackImages: Record<string, string> = {
  "Muhammad Wasim": wasimImg,
  "Muhammad Anas Ali": anasImg,
  "Muhammad Mughees": mugheesImg,
};

const fallbackTeam = [
  {
    name: "Muhammad Wasim",
    role: "CEO & Founder",
    bio: "Passionate about creating digital solutions that transform businesses. 10+ years of experience in web development and digital strategy.",
    image: wasimImg,
  },
  {
    name: "Muhammad Anas Ali",
    role: "Director Operations",
    bio: "Drives operational excellence across the organization. Leads day-to-day business operations, optimizes workflows, and ensures efficient resource allocation to deliver projects on time and within scope.",
    image: anasImg,
  },
  {
    name: "Muhammad Mughees",
    role: "Marketing Manager",
    bio: "Spearheads digital marketing strategies and brand growth initiatives. Manages campaign execution, market research, and client acquisition efforts to expand MetaEdge Creatives' market presence.",
    image: mugheesImg,
  },
];

export default function AboutPage() {
  usePageMeta("about");
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { data: dbTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    staleTime: 5 * 60 * 1000,
  });

  const team = useMemo(() => {
    if (dbTeam && dbTeam.length > 0) {
      return dbTeam.map((m) => ({
        name: m.name,
        role: m.role,
        bio: m.description,
        image: m.imageUrl || fallbackImages[m.name] || "",
        linkedinUrl: m.linkedinUrl || null,
        twitterUrl: m.twitterUrl || null,
        instagramUrl: m.instagramUrl || null,
        facebookUrl: m.facebookUrl || null,
        websiteUrl: m.websiteUrl || null,
      }));
    }
    return fallbackTeam.map(t => ({ ...t, linkedinUrl: null, twitterUrl: null, instagramUrl: null, facebookUrl: null, websiteUrl: null }));
  }, [dbTeam]);

  return (
    <div className="relative pt-20" ref={containerRef}>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${pageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />
      <div className="relative z-[1]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
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
            >
              Our Agency
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              We Turn Ideas Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Digital Reality</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              MetaEdge Creatives is a full-service digital agency specializing in web development, CRM automation, SEO, digital marketing, and social media management. We help businesses grow through innovative technology and data-driven strategies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="hover-elevate active-elevate-2" data-testid="button-start-project">Start Your Project</Button>
              <Button size="lg" variant="outline" className="hover-elevate active-elevate-2" data-testid="button-view-work">View Our Work</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Users className="w-3 h-3" />
                Who We Are
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Driving Digital Excellence Through Innovation</h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>MetaEdge Creatives was founded with a simple belief: every business deserves exceptional digital solutions that drive real growth. We started by helping small businesses build their online presence, and quickly realized the power of combining creative design with smart technology.</p>
                <p>Today, we're a full-service digital agency offering web development, custom CRM, mobile app development, AI automations, SEO and GEO, digital marketing, graphic design, and video editing. Our team specializes in creating custom solutions using cutting-edge technologies like Laravel, Node.js, Flutter, GoHighLevel, and leading marketing platforms.</p>
                <p>What sets us apart is our data-driven approach and commitment to results. We don't just build websites or run ads—we create comprehensive digital strategies that align with your business goals.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="relative"
            >
              <div className="relative aspect-square sm:aspect-video rounded-3xl overflow-hidden shadow-2xl group">
                <img src={teamOfficeImg} alt="Our Team" loading="lazy" decoding="async" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              </div>
              {/* Decorative background for image */}
              <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary/10 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              Our Core
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Mission, Vision & Values
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <AboutCard delay={0.1} className="!p-8 !bg-gray-50/50">
              <h3 className="text-xl font-bold mb-4 text-primary">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">To empower businesses with innovative digital solutions that drive growth, increase efficiency, and create lasting impact. We're committed to delivering exceptional results through creativity, technology, and strategic thinking.</p>
            </AboutCard>
            <AboutCard delay={0.2} className="!p-8 !bg-gray-50/50">
              <h3 className="text-xl font-bold mb-4 text-primary">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">To be the leading digital agency known for transforming businesses through cutting-edge technology and data-driven strategies. We envision a future where every business, regardless of size, has access to world-class digital solutions.</p>
            </AboutCard>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <AboutCard key={i} delay={0.3 + i * 0.04}>
                <v.icon className="w-10 h-10 text-primary mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                <h4 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{v.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </AboutCard>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              Our Workflow
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How We Work
            </motion.h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A proven process that delivers exceptional results every time</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processes.map((p, i) => {
              const ProcessCardRef = useRef(null);
              const isProcessInView = useInView(ProcessCardRef, { once: true, margin: "-100px" });
              return (
                <AboutCard key={i} delay={0.4 + i * 0.04} className="!p-10">
                  <div ref={ProcessCardRef}>
                    <span className="text-5xl font-black text-primary/10 absolute top-6 right-10 group-hover:text-primary/20 transition-colors duration-500">
                      <AnimatedCounter value={p.number} prefix="0" inView={isProcessInView} />
                    </span>
                    <h3 className="text-xl font-bold mb-4 pr-12 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                  </div>
                </AboutCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              The Experts
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Meet Our Team
            </motion.h2>
            <p className="text-muted-foreground">The creative minds behind MetaEdge Creatives</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {team.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="group flex flex-col items-center text-center"
              >
                {m.image ? (
                  <div className="relative w-48 h-48 rounded-full overflow-hidden mb-6 shadow-xl group-hover:shadow-primary/20 transition-all duration-500 group-hover:-translate-y-2">
                    <img src={m.image} alt={m.name} loading="lazy" decoding="async" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full mb-6 shadow-xl bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold group-hover:shadow-primary/20 transition-all duration-500 group-hover:-translate-y-2">
                    {m.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{m.name}</h3>
                <p className="text-primary text-xs font-bold mb-3 uppercase tracking-widest">
                  {m.role}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">{m.bio}</p>
                {(() => {
                  const links = [
                    { url: m.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
                    { url: m.twitterUrl, icon: Twitter, label: "Twitter" },
                    { url: m.instagramUrl, icon: Instagram, label: "Instagram" },
                    { url: m.facebookUrl, icon: Facebook, label: "Facebook" },
                    { url: m.websiteUrl, icon: Globe, label: "Website" },
                  ].filter(l => l.url);
                  if (links.length === 0) return null;
                  return (
                    <div className="flex items-center gap-3 mt-4">
                      {links.map(l => (
                        <a key={l.label} href={l.url!} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={l.label}>
                          <l.icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      </div>
    </div>
  );
}

