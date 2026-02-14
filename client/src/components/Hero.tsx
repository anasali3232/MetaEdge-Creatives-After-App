import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Sparkles, Zap, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

import heroSlideDev from "@/assets/hero-slide-dev-main.webp";
import heroSlideAi from "@/assets/hero-slide-ai-main.webp";
import heroSlideMarketing from "@/assets/images/hero-slide-marketing.webp";
import highLevelLogo from "@/assets/highlevel-logo.webp";

import { SiReact, SiNodedotjs, SiPhp, SiHtml5, SiJavascript, SiShopify, SiWordpress, SiWix, SiZapier, SiSalesforce, SiHubspot, SiFacebook, SiInstagram, SiGoogle, SiLinkedin, SiN8N, SiTypescript } from "react-icons/si";

const HighLevelIcon = () => <img src={highLevelLogo} alt="GoHighLevel" className="w-6 h-6 object-contain" />;

const slides = [
  {
    image: heroSlideDev,
    badge: "Full-Stack Excellence",
    highlight: "Custom Web",
    subtitle: "Development Solutions",
    description: "We build scalable, high-performance web applications tailored to your business needs using the latest modern technologies and enterprise-grade security.",
    stats: [
      { value: "99.9%", label: "Uptime Guaranteed", icon: Zap },
      { value: "10-Day", label: "Discovery Phase", icon: Sparkles },
      { value: "Weekly", label: "ROI Updates", icon: TrendingUp },
    ],
    platforms: [
      { icon: SiReact, name: "React", color: "#61DAFB", slug: "react" },
      { icon: SiTypescript, name: "TypeScript", color: "#3178C6", slug: "typescript" },
      { icon: SiNodedotjs, name: "Node.js", color: "#339933", slug: "nodejs" },
      { icon: SiPhp, name: "PHP", color: "#777BB4", slug: "php" },
      { icon: SiHtml5, name: "HTML5", color: "#E34F26", slug: "html5" },
      { icon: SiJavascript, name: "JavaScript", color: "#F7DF1E", slug: "javascript" },
      { icon: SiShopify, name: "Shopify", color: "#7AB55C", slug: "shopify" },
      { icon: SiWordpress, name: "WordPress", color: "#21759B", slug: "wordpress" },
      { icon: SiWix, name: "Wix", color: "#0C6EFC", slug: "wix" },
    ]
  },
  {
    image: heroSlideAi,
    badge: "Automation & Integration",
    highlight: "AI-Powered Tools",
    subtitle: "Automate & Scale",
    description: "Streamline your business with powerful automation platforms. Connect your tools, automate workflows, and manage customer relationships effortlessly.",
    stats: [
      { value: "340%", label: "Efficiency Boost", icon: TrendingUp },
      { value: "50+", label: "Integrations", icon: Zap },
      { value: "24/7", label: "Automation", icon: Sparkles },
    ],
    platforms: [
      { icon: SiN8N, name: "n8n", color: "#FF6D5A", slug: "n8n" },
      { icon: HighLevelIcon, name: "GoHighLevel", color: "#242424", slug: "gohighlevel" },
      { icon: SiZapier, name: "Zapier", color: "#FF4A00", slug: "zapier" },
      { icon: SiSalesforce, name: "Salesforce", color: "#00A1E0", slug: "salesforce" },
      { icon: SiHubspot, name: "HubSpot", color: "#FF7A59", slug: "hubspot" },
    ]
  },
  {
    image: heroSlideMarketing,
    badge: "ROI-Driven Growth",
    highlight: "Digital Marketing",
    subtitle: "That Scales Brands",
    description: "Dominate your niche with data-driven marketing strategies. From SEO and GEO to AI Automations, we craft experiences that resonate and convert.",
    stats: [
      { value: "220+", label: "Happy Clients", icon: Sparkles },
      { value: "252+", label: "Projects Completed", icon: Sparkles },
      { value: "90%", label: "Client Satisfaction", icon: TrendingUp },
      { value: "10+", label: "Years Experience", icon: Zap },
    ],
    platforms: [
      { icon: SiFacebook, name: "Facebook", color: "#1877F2", slug: "facebook" },
      { icon: SiInstagram, name: "Instagram", color: "#E4405F", slug: "instagram" },
      { icon: SiGoogle, name: "Google", color: "#4285F4", slug: "google" },
      { icon: SiLinkedin, name: "LinkedIn", color: "#0A66C2", slug: "linkedin" },
    ]
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    slides.forEach((s, i) => {
      if (i === 0) return;
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);

  const nextSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-black mt-20 sm:mt-24"
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: currentSlide === i ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 scale-105"
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative" style={{ minHeight: '450px' }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out"
              style={{
                opacity: currentSlide === i ? 1 : 0,
                pointerEvents: currentSlide === i ? 'auto' : 'none',
              }}
            >
              <div className="text-center max-w-5xl mx-auto w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm font-medium text-white">{slide.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/70">
                    {slide.highlight}
                  </span>
                  <br />
                  <span className="text-white/80">{slide.subtitle}</span>
                </h1>

                <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed mb-6">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                  <Link href="/services">
                    <Button className="no-default-hover-elevate no-default-active-elevate min-w-[180px] shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors" data-testid="button-explore-services">
                      <span className="flex items-center gap-2">
                        Explore Services
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </Link>
                  <a href="https://calendly.com/metaedgecreatives-info/30min" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="no-default-hover-elevate no-default-active-elevate min-w-[180px] bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-colors"
                      data-testid="button-get-started"
                    >
                      Book a Free Consultation
                    </Button>
                  </a>
                </div>

                <div className="mb-6">
                  <p className="text-white/50 text-xs mb-3">Technologies & Platforms We Work With</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {slide.platforms.map((platform) => (
                      <Link key={platform.name} href={`/platforms/${platform.slug}`}>
                        <div className="group relative cursor-pointer">
                          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-colors duration-300 hover:bg-white/15 hover:border-white/25">
                            <platform.icon
                              className="w-6 h-6"
                              style={{ color: platform.color }}
                            />
                          </div>
                          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 invisible group-hover:visible whitespace-nowrap">
                            <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                              {platform.name}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 flex-wrap">
                  {slide.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 text-white/80">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold">{stat.value}</span>
                      <span className="text-xs text-white/50">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="no-default-hover-elevate no-default-active-elevate pointer-events-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="no-default-hover-elevate no-default-active-elevate pointer-events-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
            data-testid="button-hero-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentSlide(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentSlide === index ? "w-10 bg-primary shadow-lg shadow-primary/50" : "w-3 bg-white/20 hover:bg-white/40"
              }`}
              data-testid={`button-hero-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
