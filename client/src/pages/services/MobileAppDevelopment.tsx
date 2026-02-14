import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Smartphone,
  Layers,
  Zap,
  Palette,
  Link2,
  Rocket,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MonitorSmartphone,
  ShieldCheck,
  BarChart3,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SiFlutter, SiReact, SiSwift, SiKotlin, SiAndroidstudio, SiFigma, SiFirebase } from "react-icons/si";
import { nameToSlugMap } from "@/data/platforms";
import AnimatedCounter from "@/components/AnimatedCounter";
import CTA from "@/components/CTA";
import ServicePortfolio from "@/components/ServicePortfolio";
import serviceTechBg from "@/assets/bg-mobile-app.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

const platforms = [
  { icon: SiFlutter, name: "Flutter", color: "#02569B", slug: "flutter" },
  { icon: SiReact, name: "React Native", color: "#61DAFB", slug: "react-native" },
  { icon: SiSwift, name: "Swift", color: "#FA7343", slug: "swift" },
  { icon: SiKotlin, name: "Kotlin", color: "#7F52FF", slug: "kotlin" },
  { icon: SiAndroidstudio, name: "Android Studio", color: "#3DDC84", slug: "android-studio" },
  { icon: SiFigma, name: "Figma", color: "#F24E1E", slug: "figma" },
  { icon: SiFirebase, name: "Firebase", color: "#FFCA28", slug: "" },
];

const features = [
  {
    icon: Layers,
    title: "Cross-Platform Development",
    description: "Build once, deploy everywhere with Flutter and React Native frameworks."
  },
  {
    icon: Zap,
    title: "Native Performance",
    description: "Achieve near-native speed and responsiveness on both iOS and Android."
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Intuitive, beautiful interfaces designed for seamless user experiences."
  },
  {
    icon: Link2,
    title: "API Integration",
    description: "Connect your app with third-party services and backend systems effortlessly."
  },
  {
    icon: Rocket,
    title: "App Store Deployment",
    description: "End-to-end submission and optimization for Apple App Store and Google Play."
  },
  {
    icon: Wrench,
    title: "Ongoing Maintenance",
    description: "Continuous updates, bug fixes, and performance monitoring post-launch."
  }
];

const services = [
  "iOS & Android app development",
  "Cross-platform development (Flutter, React Native)",
  "UI/UX design & prototyping",
  "App store submission & optimization",
  "Push notifications & analytics",
  "Third-party API integrations",
  "App maintenance & updates",
  "App testing & QA"
];

const benefits = [
  { value: "252+", label: "Apps Delivered", description: "Across industries" },
  { value: "98%", label: "Client Satisfaction", description: "On all projects" },
  { value: "25+", label: "Industries Served", description: "Diverse expertise" },
  { value: "4.8", label: "Avg. Rating", description: "On app stores" }
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

export default function MobileAppDevelopmentPage() {
  usePageMeta("services/mobile-app-development");
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
                <Smartphone className="w-4 h-4" />
                Cross-Platform
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Mobile App{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Development
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Build powerful native and cross-platform mobile applications that deliver exceptional user experiences. From concept to launch, we craft apps that perform beautifully on iOS and Android.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-start-project">
                    Start Your App
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
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-6">Technologies We Use</h3>
                <div className="grid grid-cols-4 gap-4">
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
            {benefits.map((benefit, idx) => {
              const benefitRef = useRef(null);
              const isBenefitInView = useInView(benefitRef, { once: true, margin: "-100px" });
              const numValue = parseFloat(benefit.value);
              const suffix = benefit.value.replace(/[0-9.]/g, '');

              return (
                <motion.div
                  key={idx}
                  ref={benefitRef}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-2">
                    <AnimatedCounter value={numValue} suffix={suffix} inView={isBenefitInView} />
                  </div>
                  <div className="font-semibold mb-1">{benefit.label}</div>
                  <div className="text-sm text-muted-foreground">{benefit.description}</div>
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
                Complete Mobile <span className="text-primary">Solutions</span>
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
              <h3 className="text-xl font-bold mb-6">Why Mobile Matters</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <MonitorSmartphone className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Multi-Device Reach</h4>
                    <p className="text-sm text-muted-foreground">Reach users on smartphones and tablets with responsive, adaptive apps</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Secure & Reliable</h4>
                    <p className="text-sm text-muted-foreground">Enterprise-grade security with encrypted data and secure authentication</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Globe className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Offline Capability</h4>
                    <p className="text-sm text-muted-foreground">Apps that work seamlessly even without an internet connection</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <BarChart3 className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Analytics & Insights</h4>
                    <p className="text-sm text-muted-foreground">Built-in analytics to track user behavior and app performance</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ServicePortfolio category="Mobile App Development" />
      <CTA />
      </div>
    </div>
  );
}