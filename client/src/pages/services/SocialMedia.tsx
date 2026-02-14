import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Share2, 
  Palette, 
  Video, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Heart,
  MessageCircle,
  TrendingUp,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiPinterest, SiBuffer, SiCanva } from "react-icons/si";
import AnimatedCounter from "@/components/AnimatedCounter";
import ServicePortfolio from "@/components/ServicePortfolio";
import CTA from "@/components/CTA";

const platforms = [
  { icon: SiFacebook, name: "Facebook", color: "#1877F2" },
  { icon: SiInstagram, name: "Instagram", color: "#E4405F" },
  { icon: SiLinkedin, name: "LinkedIn", color: "#0A66C2" },
  { icon: SiTiktok, name: "TikTok", color: "#000000" },
  { icon: SiPinterest, name: "Pinterest", color: "#BD081C" },
  { icon: SiBuffer, name: "Buffer", color: "#231F20" },
  { icon: SiCanva, name: "Canva", color: "#00C4CC" },
];

const features = [
  {
    icon: Palette,
    title: "Creative Content",
    description: "Eye-catching graphics and visuals that stop the scroll."
  },
  {
    icon: Video,
    title: "Video Production",
    description: "Engaging video content optimized for each platform."
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Organized posting schedule for consistent presence."
  },
  {
    icon: Users,
    title: "Community Management",
    description: "Engage with your audience and build loyal followers."
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description: "Data-driven strategies to grow your following."
  },
  {
    icon: MessageCircle,
    title: "Engagement Boost",
    description: "Increase likes, comments, and shares organically."
  }
];

const services = [
  "Content creation (graphics, videos, captions)",
  "Social media strategy & content calendar",
  "Post scheduling & publishing",
  "Community management & engagement",
  "Hashtag research & optimization",
  "Influencer collaboration",
  "Monthly analytics & performance reporting",
  "Brand voice development"
];

const results = [
  { value: "300%", label: "Engagement Increase", description: "On average" },
  { value: "50K+", label: "Followers Grown", description: "For our clients" },
  { value: "500+", label: "Posts Created", description: "Monthly" },
  { value: "24/7", label: "Monitoring", description: "Always active" }
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-6 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      data-testid={`feature-card-${index}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: isHovered
            ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.08), transparent 40%)`
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

export default function SocialMediaPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className="pt-20">
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
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Share2 className="w-4 h-4" />
                Brand Growth
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Social Media{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Management
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Professional social media management that builds your brand and engages your audience. We create stunning content and manage your channels so you can focus on your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-start-project">
                    Grow Your Social
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
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
                <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-primary text-white shadow-lg">
                  <Share2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-6">Platforms We Manage</h3>
                <div className="grid grid-cols-4 gap-4">
                  {platforms.map((platform, index) => (
                    <motion.div
                      key={platform.name}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="group relative flex flex-col items-center"
                    >
                      <div 
                        className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm"
                      >
                        <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

      <section className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {results.map((result, idx) => {
              const resultRef = useRef(null);
              const isResultInView = useInView(resultRef, { once: true, margin: "-100px" });
              const numValue = parseInt(result.value) || 0;
              const suffix = result.value.replace(/[0-9]/g, '');
              const isText = isNaN(parseInt(result.value));

              return (
                <motion.div
                  key={idx}
                  ref={resultRef}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">
                    {isText ? result.value : <AnimatedCounter value={numValue} suffix={suffix} inView={isResultInView} />}
                  </div>
                  <div className="font-semibold mb-1">{result.label}</div>
                  <div className="text-sm text-muted-foreground">{result.description}</div>
                </motion.div>
              );
            })}
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
              initial={{ opacity: 0, y: 20 }}
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
                Complete Social <span className="text-primary">Solutions</span>
              </h2>
              <div className="space-y-4">
                {services.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
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
              className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6">Content Types We Create</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <Camera className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Photo Posts</h4>
                  <p className="text-sm text-muted-foreground">Stunning visuals</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <Video className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Video Content</h4>
                  <p className="text-sm text-muted-foreground">Reels & Stories</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <Palette className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Graphics</h4>
                  <p className="text-sm text-muted-foreground">Branded designs</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <MessageCircle className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">Captions</h4>
                  <p className="text-sm text-muted-foreground">Engaging copy</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ServicePortfolio category="Social Media" />

      <CTA />
    </div>
  );
}
