import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown, Code, Zap, Search, Megaphone, Video, Palette, Users, HelpCircle, Database, Smartphone, Star, Briefcase, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo-metaedge.webp";

import { Link, useLocation } from "wouter";
import { prefetchRoute } from "@/lib/prefetch";
import { useClientAuth } from "@/hooks/use-client-auth";

const serviceLinks = [
  { name: "Web Development", href: "/services/web-development", icon: Code },
  { name: "Custom CRM", href: "/services/custom-crm", icon: Database },
  { name: "Mobile App Development", href: "/services/mobile-app-development", icon: Smartphone },
  { name: "AI Automation", href: "/services/ai-automation", icon: Zap },
  { name: "SEO and GEO", href: "/services/seo-and-geo", icon: Search },
  { name: "Digital Marketing", href: "/services/digital-marketing", icon: Megaphone },
  { name: "Graphic Design", href: "/services/graphic-design", icon: Palette },
  { name: "Video Editing", href: "/services/video-editing", icon: Video },
];

const aboutLinks = [
  { name: "About Us", href: "/about", icon: Users },
  { name: "Testimonials", href: "/about/testimonials", icon: Star },
  { name: "Careers", href: "/careers", icon: Briefcase },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
];

const navLinks = [
  { name: "Home", href: "/", isAnchor: true, targetId: "#home" },
  { name: "Services", href: "/services", isAnchor: false, hasDropdown: true, dropdownType: "services" },
  { name: "About", href: "/about", isAnchor: false, hasDropdown: true, dropdownType: "about" },
  { name: "Portfolio", href: "/portfolio", isAnchor: false },
  { name: "Blog", href: "/blog", isAnchor: false },
  { name: "Contact", href: "/contact", isAnchor: false },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useClientAuth();
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setIsAboutOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setActiveLink(link.name);
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
    setIsMobileAboutOpen(false);
    if (link.isAnchor && location === "/") {
      const element = document.querySelector(link.targetId!);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isActive = (link: typeof navLinks[0]) => {
    if (!link.isAnchor) {
      if (link.name === "Services") {
        return location.startsWith("/services");
      }
      if (link.name === "About") {
        return location === "/about" || location === "/faqs" || location === "/about/testimonials" || location === "/careers";
      }
      return location === link.href;
    }
    if (link.isAnchor && location === "/") {
      return activeLink === link.name;
    }
    return false;
  };

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    setIsServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
  };

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current);
    }
    setIsAboutOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setIsAboutOpen(false);
    }, 150);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-4 flex-shrink-0" data-testid="logo-container">
              <div className="relative w-28 h-28 sm:w-40 sm:h-40 overflow-hidden -my-10">
                <img
                  src={logoImage}
                  alt="MetaEdge Creatives"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-wrap">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative px-2"
                  ref={link.dropdownType === "services" ? servicesDropdownRef : link.dropdownType === "about" ? aboutDropdownRef : undefined}
                  onMouseEnter={link.dropdownType === "services" ? handleServicesMouseEnter : link.dropdownType === "about" ? handleAboutMouseEnter : undefined}
                  onMouseLeave={link.dropdownType === "services" ? handleServicesMouseLeave : link.dropdownType === "about" ? handleAboutMouseLeave : undefined}
                >
                  {link.isAnchor && location === "/" ? (
                    <button
                      onClick={() => handleNavClick(link)}
                      onMouseEnter={() => prefetchRoute(link.href)}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover-elevate ${
                        isActive(link)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`nav-${link.name.toLowerCase()}`}
                    >
                      {link.name}
                      {isActive(link) && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  ) : link.dropdownType === "services" ? (
                    <>
                      <Link
                        href={link.href}
                        onMouseEnter={() => prefetchRoute(link.href)}
                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover-elevate ${
                          isActive(link)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        data-testid={`nav-${link.name.toLowerCase()}`}
                      >
                        {link.name}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                        {isActive(link) && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                      <AnimatePresence>
                        {isServicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50"
                          >
                            {serviceLinks.map((service, idx) => (
                              <Link
                                key={service.name}
                                href={service.href}
                                onClick={() => setIsServicesOpen(false)}
                                onMouseEnter={() => prefetchRoute(service.href)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover-elevate transition-all duration-200 rounded-lg"
                                data-testid={`dropdown-service-${idx}`}
                              >
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <service.icon className="w-4 h-4 text-primary" />
                                </div>
                                {service.name}
                              </Link>
                            ))}
                            <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                              <Link
                                href="/services"
                                onClick={() => setIsServicesOpen(false)}
                                className="flex items-center gap-2 py-2 text-sm font-medium text-primary"
                                data-testid="dropdown-view-all-services"
                              >
                                View All Services
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : link.dropdownType === "about" ? (
                    <>
                      <Link
                        href={link.href}
                        onMouseEnter={() => prefetchRoute(link.href)}
                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover-elevate ${
                          isActive(link)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        data-testid={`nav-${link.name.toLowerCase()}`}
                      >
                        {link.name}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                        {isActive(link) && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                      <AnimatePresence>
                        {isAboutOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50"
                          >
                            {aboutLinks.map((aboutLink, idx) => (
                              <Link
                                key={aboutLink.name}
                                href={aboutLink.href}
                                onClick={() => setIsAboutOpen(false)}
                                onMouseEnter={() => prefetchRoute(aboutLink.href)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover-elevate transition-all duration-200 rounded-lg"
                                data-testid={`dropdown-about-${idx}`}
                              >
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <aboutLink.icon className="w-4 h-4 text-primary" />
                                </div>
                                {aboutLink.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => handleNavClick(link)}
                      onMouseEnter={() => prefetchRoute(link.href)}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover-elevate ${
                        isActive(link)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`nav-${link.name.toLowerCase()}`}
                    >
                      {link.name}
                      {isActive(link) && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2 flex-wrap">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/client/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Open Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            navigate("/");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/client/login">
                    <Button variant="ghost" size="sm" className="flex text-muted-foreground hover:text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link href="/client/signup">
                    <Button size="sm" className="flex">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover-elevate"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border lg:hidden max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col flex-wrap gap-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.dropdownType === "services" ? (
                    <>
                      <button
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-lg hover-elevate ${
                          location.startsWith("/services")
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                        data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                      >
                        {link.name}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isMobileServicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2 space-y-1"
                          >
                            {serviceLinks.map((service, idx) => (
                              <Link
                                key={service.name}
                                href={service.href}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileServicesOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover-elevate rounded-lg"
                                data-testid={`mobile-dropdown-service-${idx}`}
                              >
                                <service.icon className="w-4 h-4 text-primary" />
                                {service.name}
                              </Link>
                            ))}
                            <Link
                              href="/services"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileServicesOpen(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary"
                              data-testid="mobile-view-all-services"
                            >
                              View All Services
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : link.dropdownType === "about" ? (
                    <>
                      <button
                        onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
                        className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-lg hover-elevate ${
                          location === "/about" || location === "/faqs" || location === "/about/testimonials" || location === "/careers"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                        data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                      >
                        {link.name}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileAboutOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isMobileAboutOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2 space-y-1"
                          >
                            {aboutLinks.map((aboutLink, idx) => (
                              <Link
                                key={aboutLink.name}
                                href={aboutLink.href}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileAboutOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover-elevate rounded-lg"
                                data-testid={`mobile-dropdown-about-${idx}`}
                              >
                                <aboutLink.icon className="w-4 h-4 text-primary" />
                                {aboutLink.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => handleNavClick(link)}
                      className={`block px-4 py-3 text-left rounded-lg hover-elevate ${
                        location === link.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
