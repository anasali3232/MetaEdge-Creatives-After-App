import { motion } from "framer-motion";
import { ArrowUp, Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";
import { SiLinkedin, SiInstagram, SiFacebook, SiTiktok, SiYoutube, SiX, SiPinterest, SiSnapchat, SiThreads } from "react-icons/si";
import type { IconType } from "react-icons";
import logoImage from "@/assets/logo-metaedge.webp";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";
import TurnstileWidget from "@/components/TurnstileWidget";

const footerLinks = {
  services: [
    { name: "Web Development", href: "/services/web-development" },
    { name: "Custom CRM", href: "/services/custom-crm" },
    { name: "Mobile App Development", href: "/services/mobile-app-development" },
    { name: "AI Automation", href: "/services/ai-automation" },
    { name: "SEO and GEO", href: "/services/seo-and-geo" },
    { name: "Digital Marketing", href: "/services/digital-marketing" },
    { name: "Graphic Design", href: "/services/graphic-design" },
    { name: "Video Editing", href: "/services/video-editing" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Testimonials", href: "/about/testimonials" },
    { name: "Our Work", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Workspace Policy", href: "/workspace-policy" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const { toast } = useToast();
  const { get } = useSiteSettings();

  const allSocialPlatforms: { key: string; icon: IconType; label: string }[] = [
    { key: "facebook", icon: SiFacebook, label: "Facebook" },
    { key: "instagram", icon: SiInstagram, label: "Instagram" },
    { key: "linkedin", icon: SiLinkedin, label: "LinkedIn" },
    { key: "tiktok", icon: SiTiktok, label: "TikTok" },
    { key: "youtube", icon: SiYoutube, label: "YouTube" },
    { key: "twitter", icon: SiX, label: "X" },
    { key: "pinterest", icon: SiPinterest, label: "Pinterest" },
    { key: "snapchat", icon: SiSnapchat, label: "Snapchat" },
    { key: "threads", icon: SiThreads, label: "Threads" },
  ];

  const socialLinks = allSocialPlatforms
    .map((s) => ({ ...s, href: get(s.key) }))
    .filter((s) => s.href && s.href.trim() !== "");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Subscribed!", description: data.message || "You've been subscribed to our newsletter." });
        setEmail("");
        setTurnstileToken("");
        setTurnstileKey((k) => k + 1);
      } else {
        toast({ title: "Oops!", description: data.error || "Something went wrong.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to subscribe. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative text-white selection:bg-white selection:text-[#C41E3A] overflow-hidden">
      {/* Top Wave / Decorative Separator */}
      <div className="relative bg-transparent -mb-px">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block translate-y-[1px]" preserveAspectRatio="none">
          <path d="M0,80 L0,40 Q360,0 720,40 Q1080,80 1440,40 L1440,80 Z" fill="#C41E3A" />
        </svg>
      </div>

      {/* Main Footer */}
      <div className="relative bg-[#C41E3A] overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 0l40 40L0 80z'/%3E%3Cpath d='M80 0L40 40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Soft radial glow accents - white/warm only, no black */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* Newsletter Banner */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="relative -mt-2 mb-16 rounded-2xl border border-white/20 bg-white/[0.12] backdrop-blur-xl p-8 md:p-10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/75">Stay Connected</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Get the Latest Insights</h3>
                <p className="text-white/75 text-sm max-w-md">Join our exclusive list to receive digital trends, case studies, and agency updates directly to your inbox.</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex-shrink-0 w-full md:w-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full md:w-72 h-12 px-5 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    required
                    data-testid="input-newsletter-email"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    className="h-12 px-6 bg-white text-[#C41E3A] font-bold text-sm rounded-xl transition-all hover:bg-white/90 active:scale-[0.97] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    data-testid="button-newsletter-submit"
                  >
                    <Send className="w-4 h-4" />
                    Subscribe
                  </button>
                </div>
                <TurnstileWidget key={turnstileKey} onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} className="mt-3" />
              </form>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6" data-testid="footer-logo-container">
                <div className="relative w-12 h-12 p-1.5 bg-white rounded-xl overflow-hidden">
                  <img
                    src={logoImage}
                    alt="MetaEdge Creatives"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-white tracking-tight">
                    MetaEdge
                  </span>
                  <span className="block text-[10px] text-white/70 tracking-[0.25em] uppercase font-semibold">
                    Creatives
                  </span>
                </div>
              </div>

              <p className="text-white/80 mb-8 max-w-xs leading-relaxed text-[15px]" data-testid="text-footer-description">
                Innovate, Create, Elevate. We transform bold ideas into exceptional digital experiences that drive growth.
              </p>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <a
                  href={`mailto:${get("email")}`}
                  className="flex items-center gap-3 text-white/75 hover:text-white transition-colors group"
                  data-testid="link-footer-email"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 group-hover:border-white/25 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{get("email")}</span>
                </a>
                <a
                  href={`tel:${get("phone").replace(/[\s()-]/g, "")}`}
                  className="flex items-center gap-3 text-white/75 hover:text-white transition-colors group"
                  data-testid="link-footer-phone"
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 group-hover:border-white/25 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{get("phone")}</span>
                </a>
                <div className="flex items-start gap-3 text-white/75">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm leading-relaxed pt-1.5">{get("address")}</span>
                </div>
              </div>

              {/* Social Links - only show when at least one link exists */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.08] text-white/75 hover:bg-white hover:text-[#C41E3A] border border-white/10 hover:border-white transition-all duration-300 active:scale-95"
                      aria-label={social.label}
                      data-testid={`link-social-${social.label.toLowerCase()}`}
                    >
                      <social.icon className="w-[18px] h-[18px]" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Services Column */}
            <div className="lg:col-span-3" data-testid="section-footer-services">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-6" data-testid="heading-footer-services">Services</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link, index) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 hover:text-white transition-colors inline-flex items-center gap-1 group"
                      data-testid={`link-footer-service-${index}`}
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="lg:col-span-2" data-testid="section-footer-company">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-6" data-testid="heading-footer-company">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 hover:text-white transition-colors inline-flex items-center gap-1 group"
                      data-testid={`link-footer-company-${index}`}
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Column */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 border-t border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/55" data-testid="text-footer-copyright">
                © {new Date().getFullYear()} MetaEdge Creatives. All rights reserved.
              </p>

              <button
                onClick={scrollToTop}
                className="group flex items-center gap-2 text-xs text-white/55 hover:text-white transition-all"
                data-testid="button-scroll-to-top"
              >
                Back to top
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/10 group-hover:bg-white group-hover:text-[#C41E3A] group-hover:border-white transition-all duration-300">
                  <ArrowUp className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}