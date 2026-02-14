import filmoraLogo from "@/assets/filmora.webp";
import capcutLogo from "@/assets/capcut.webp";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Video, 
  Film, 
  Scissors, 
  Music, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Play,
  Tv,
  Clapperboard,
  Wand2,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SiAdobepremierepro, SiAdobeaftereffects, SiDavinciresolve } from "react-icons/si";
import { nameToSlugMap } from "@/data/platforms";
import AnimatedCounter from "@/components/AnimatedCounter";
import CTA from "@/components/CTA";
import ServicePortfolio from "@/components/ServicePortfolio";
import serviceTechBg from "@/assets/bg-video-editing.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

const platforms = [
  { icon: SiAdobepremierepro, name: "Premiere Pro", color: "#9999FF", slug: "premiere-pro" },
  { icon: SiAdobeaftereffects, name: "After Effects", color: "#9999FF", slug: "adobe-after-effects" },
  { icon: SiDavinciresolve, name: "DaVinci Resolve", color: "#FF5733", slug: "davinci-resolve" },
  { icon: () => <img src={filmoraLogo} alt="Filmora" className="w-6 h-6 object-contain" />, name: "Filmora", color: "#00A4EF", slug: "filmora" },
  { icon: () => <img src={capcutLogo} alt="CapCut" className="w-6 h-6 object-contain" />, name: "CapCut", color: "#000000", slug: "capcut" },
];

const features = [
  {
    icon: Scissors,
    title: "Professional Editing",
    description: "Seamless cuts, transitions, and pacing for polished videos."
  },
  {
    icon: Wand2,
    title: "Motion Graphics",
    description: "Eye-catching animations and visual effects."
  },
  {
    icon: Music,
    title: "Audio Enhancement",
    description: "Crystal clear audio with music and sound effects."
  },
  {
    icon: Film,
    title: "Color Grading",
    description: "Professional color correction for cinematic look."
  },
  {
    icon: Tv,
    title: "Multi-Platform",
    description: "Optimized for YouTube, Instagram, TikTok, and more."
  },
  {
    icon: Play,
    title: "Fast Turnaround",
    description: "Quick delivery without compromising quality."
  }
];

const services = [
  "Corporate & promotional videos",
  "Social media video content",
  "YouTube video editing",
  "Product demos & explainer videos",
  "Motion graphics & animations",
  "Video ads for digital marketing",
  "Podcast video editing",
  "Event & wedding video editing"
];

const results = [
  { value: "1000+", label: "Videos Edited", description: "And counting" },
  { value: "48hr", label: "Avg Turnaround", description: "Quick delivery" },
  { value: "4K", label: "Quality", description: "Ultra HD ready" },
  { value: "100%", label: "Satisfaction", description: "Guaranteed" }
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

export default function VideoEditingPage() {
  usePageMeta("services/video-editing");
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
                <Video className="w-4 h-4" />
                Creative Excellence
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Video{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Editing
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Professional video editing that tells your story. From corporate videos to social media content, we create engaging videos that captivate your audience and drive results.
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
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-6">Software We Use</h3>
                <div className="grid grid-cols-3 gap-4">
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
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
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
                Complete Video <span className="text-primary">Solutions</span>
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
              className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6">Our Editing Process</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Footage Review</h4>
                    <p className="text-sm text-muted-foreground">We review your raw footage and understand your vision</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Rough Cut</h4>
                    <p className="text-sm text-muted-foreground">Initial edit with basic structure and pacing</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Fine Tuning</h4>
                    <p className="text-sm text-muted-foreground">Color grading, audio, effects, and transitions</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Final Delivery</h4>
                    <p className="text-sm text-muted-foreground">Export in your preferred format and resolution</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ServicePortfolio category="Social Media" />
      <CTA />
      </div>
    </div>
  );
}
