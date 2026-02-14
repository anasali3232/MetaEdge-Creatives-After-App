const prefetched = new Set<string>();

const routeMap: Record<string, () => Promise<any>> = {
  "/about": () => import("@/pages/About"),
  "/services": () => import("@/pages/Services"),
  "/contact": () => import("@/pages/Contact"),
  "/services/web-development": () => import("@/pages/services/WebDevelopment"),
  "/services/custom-crm": () => import("@/pages/services/CustomCRM"),
  "/services/mobile-app-development": () => import("@/pages/services/MobileAppDevelopment"),
  "/services/ai-automation": () => import("@/pages/services/CRMAutomation"),
  "/services/seo-and-geo": () => import("@/pages/services/SEO"),
  "/services/digital-marketing": () => import("@/pages/services/DigitalMarketing"),
  "/services/graphic-design": () => import("@/pages/services/GraphicDesign"),
  "/services/video-editing": () => import("@/pages/services/VideoEditing"),
  "/about/testimonials": () => import("@/pages/Testimonials"),
  "/faqs": () => import("@/pages/FAQs"),
  "/portfolio": () => import("@/pages/Portfolio"),
  "/portfolio/_detail": () => import("@/pages/PortfolioProject"),
  "/blog": () => import("@/pages/Blog"),
  "/blog/_detail": () => import("@/pages/BlogPost"),
  "/careers": () => import("@/pages/Careers"),
  "/careers/_detail": () => import("@/pages/CareerDetail"),
  "/privacy-policy": () => import("@/pages/PrivacyPolicy"),
  "/terms-of-service": () => import("@/pages/TermsOfService"),
  "/workspace-policy": () => import("@/pages/WorkspacePolicy"),
  "/platforms/_detail": () => import("@/pages/PlatformPage"),
};

export function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const loader = routeMap[path];
  if (loader) {
    prefetched.add(path);
    loader();
  }
}

export function prefetchRoutes(paths: string[]) {
  paths.forEach(prefetchRoute);
}

export const pagePrefetchMap: Record<string, string[]> = {
  "/": ["/about", "/services", "/contact", "/portfolio", "/blog"],
  "/about": ["/services", "/contact", "/about/testimonials", "/faqs", "/careers"],
  "/services": ["/services/web-development", "/services/custom-crm", "/services/mobile-app-development", "/services/ai-automation", "/services/seo-and-geo", "/services/digital-marketing", "/services/graphic-design", "/services/video-editing"],
  "/portfolio": ["/portfolio/_detail", "/contact"],
  "/blog": ["/blog/_detail"],
  "/careers": ["/careers/_detail"],
};
