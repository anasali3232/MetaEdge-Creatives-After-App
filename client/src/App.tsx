import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useSpring } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import TeamPortalBottomNav from "@/components/TeamPortalBottomNav";
import { prefetchRoutes, pagePrefetchMap } from "@/lib/prefetch";

import techBg from "@/assets/tech-bg.webp";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Contact = lazy(() => import("@/pages/Contact"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Blog = lazy(() => import("@/pages/Blog"));
const Careers = lazy(() => import("@/pages/Careers"));
const LiveChatWidget = lazy(() => import("@/components/LiveChatWidget"));
const NotFound = lazy(() => import("@/pages/not-found"));
const WebDevelopment = lazy(() => import("@/pages/services/WebDevelopment"));
const CustomCRM = lazy(() => import("@/pages/services/CustomCRM"));
const MobileAppDevelopment = lazy(() => import("@/pages/services/MobileAppDevelopment"));
const AIAutomation = lazy(() => import("@/pages/services/CRMAutomation"));
const SEOGEO = lazy(() => import("@/pages/services/SEO"));
const DigitalMarketing = lazy(() => import("@/pages/services/DigitalMarketing"));
const GraphicDesign = lazy(() => import("@/pages/services/GraphicDesign"));
const VideoEditing = lazy(() => import("@/pages/services/VideoEditing"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const FAQs = lazy(() => import("@/pages/FAQs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const WorkspacePolicy = lazy(() => import("@/pages/WorkspacePolicy"));
const PlatformPage = lazy(() => import("@/pages/PlatformPage"));
const PortfolioProject = lazy(() => import("@/pages/PortfolioProject"));
const BlogPostPage = lazy(() => import("@/pages/BlogPost"));
const AdminBlog = lazy(() => import("@/pages/AdminBlog"));
const CareerDetail = lazy(() => import("@/pages/CareerDetail"));
const AdminCareers = lazy(() => import("@/pages/AdminCareers"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const AdminTeam = lazy(() => import("@/pages/AdminTeam"));
const AdminMessages = lazy(() => import("@/pages/AdminMessages"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminPages = lazy(() => import("@/pages/AdminPages"));
const AdminNewsletter = lazy(() => import("@/pages/AdminNewsletter"));
const AdminClients = lazy(() => import("@/pages/AdminClients"));
const AdminTickets = lazy(() => import("@/pages/AdminTickets"));
const AdminLiveChat = lazy(() => import("@/pages/AdminLiveChat"));
const AdminApplications = lazy(() => import("@/pages/AdminApplications"));
const AdminFAQs = lazy(() => import("@/pages/AdminFAQs"));
const AdminLeaves = lazy(() => import("@/pages/AdminLeaves"));
const AdminEmployeeReports = lazy(() => import("@/pages/AdminEmployeeReports"));
const ClientLogin = lazy(() => import("@/pages/ClientLogin"));
const ClientSignup = lazy(() => import("@/pages/ClientSignup"));
const ClientForgotPassword = lazy(() => import("@/pages/ClientForgotPassword"));
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
const TeamPortalLogin = lazy(() => import("@/pages/TeamPortalLogin"));
const TeamPortalDashboard = lazy(() => import("@/pages/TeamPortalDashboard"));
const TeamPortalEmployees = lazy(() => import("@/pages/TeamPortalEmployees"));
const TeamPortalTeams = lazy(() => import("@/pages/TeamPortalTeams"));
const TeamPortalTasks = lazy(() => import("@/pages/TeamPortalTasks"));
const TeamPortalTimesheet = lazy(() => import("@/pages/TeamPortalTimesheet"));
const TeamPortalLeaves = lazy(() => import("@/pages/TeamPortalLeaves"));
const TeamPortalNotes = lazy(() => import("@/pages/TeamPortalNotes"));
const TeamPortalWeeklyReports = lazy(() => import("@/pages/TeamPortalWeeklyReports"));
const TeamPortalMonthlyReports = lazy(() => import("@/pages/TeamPortalMonthlyReports"));
const TeamPortalScreenshots = lazy(() => import("@/pages/TeamPortalScreenshots"));

function usePrefetchRoutes() {
  const [location] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const toPrefetch = pagePrefetchMap[location];
      if (toPrefetch) {
        prefetchRoutes(toPrefetch);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [location]);
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
      style={{ scaleX }}
    />
  );
}

function PageLoader() {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/about/testimonials" component={Testimonials} />
        <Route path="/services" component={Services} />
        <Route path="/services/web-development" component={WebDevelopment} />
        <Route path="/services/custom-crm" component={CustomCRM} />
        <Route path="/services/mobile-app-development" component={MobileAppDevelopment} />
        <Route path="/services/ai-automation" component={AIAutomation} />
        <Route path="/services/seo-and-geo" component={SEOGEO} />
        <Route path="/services/digital-marketing" component={DigitalMarketing} />
        <Route path="/services/graphic-design" component={GraphicDesign} />
        <Route path="/services/video-editing" component={VideoEditing} />
        <Route path="/faqs" component={FAQs} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/workspace-policy" component={WorkspacePolicy} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/portfolio/:slug" component={PortfolioProject} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/careers" component={Careers} />
        <Route path="/careers/:slug" component={CareerDetail} />
        <Route path="/admin/careers" component={AdminCareers} />
        <Route path="/admin/messages" component={AdminMessages} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/pages" component={AdminPages} />
        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route path="/admin/clients" component={AdminClients} />
        <Route path="/admin/tickets" component={AdminTickets} />
        <Route path="/admin/live-chat" component={AdminLiveChat} />
        <Route path="/admin/applications" component={AdminApplications} />
        <Route path="/admin/faqs" component={AdminFAQs} />
        <Route path="/admin/leaves" component={AdminLeaves} />
        <Route path="/admin/reports" component={AdminEmployeeReports} />
        <Route path="/client/login" component={ClientLogin} />
        <Route path="/client/signup" component={ClientSignup} />
        <Route path="/client/forgot-password" component={ClientForgotPassword} />
        <Route path="/client/dashboard" component={ClientDashboard} />
        <Route path="/team-portal">
          <Redirect to="/team-portal/login" />
        </Route>
        <Route path="/team-portal/login" component={TeamPortalLogin} />
        <Route path="/team-portal/dashboard" component={TeamPortalDashboard} />
        <Route path="/team-portal/employees" component={TeamPortalEmployees} />
        <Route path="/team-portal/teams" component={TeamPortalTeams} />
        <Route path="/team-portal/tasks" component={TeamPortalTasks} />
        <Route path="/team-portal/timesheet" component={TeamPortalTimesheet} />
        <Route path="/team-portal/leaves" component={TeamPortalLeaves} />
        <Route path="/team-portal/notes" component={TeamPortalNotes} />
        <Route path="/team-portal/weekly-reports" component={TeamPortalWeeklyReports} />
        <Route path="/team-portal/monthly-reports" component={TeamPortalMonthlyReports} />
        <Route path="/team-portal/screenshots" component={TeamPortalScreenshots} />
        <Route path="/platforms/:slug" component={PlatformPage} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function ChatWidgetWithClientInfo() {
  const [location] = useLocation();
  const [clientInfo, setClientInfo] = useState<{ name?: string; email?: string }>({});

  const readClientInfo = useCallback(() => {
    const saved = localStorage.getItem("client_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setClientInfo({ name: user.name, email: user.email });
      } catch {
        setClientInfo({});
      }
    } else {
      setClientInfo({});
    }
  }, []);

  useEffect(() => {
    readClientInfo();
  }, [location, readClientInfo]);

  useEffect(() => {
    window.addEventListener("storage", readClientInfo);
    return () => window.removeEventListener("storage", readClientInfo);
  }, [readClientInfo]);

  return (
    <Suspense fallback={null}>
      <LiveChatWidget clientName={clientInfo.name} clientEmail={clientInfo.email} />
    </Suspense>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  const isClientAuthPage = location.startsWith("/client/login") || location.startsWith("/client/signup") || location.startsWith("/client/forgot-password");
  const isClientDashboard = location.startsWith("/client/dashboard");
  const isTeamPortalPage = location.startsWith("/team-portal");
  const isTeamPortalLogin = location === "/team-portal/login" || location === "/team-portal";
  const showBottomNav = isTeamPortalPage && !isTeamPortalLogin;
  const hideChrome = isAdminPage || isClientAuthPage || isClientDashboard || isTeamPortalPage;
  const [bgLoaded, setBgLoaded] = useState(false);

  usePrefetchRoutes();

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = techBg;
  }, []);

  return (
    <div className="relative">
      {bgLoaded && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${techBg})`,
            backgroundSize: '800px 800px',
            backgroundRepeat: 'repeat',
            opacity: 0.65,
            willChange: 'auto',
          }}
        />
      )}
      <div className="relative z-[1]">
        <ScrollToTop />
        {!hideChrome && <ProgressBar />}
        <Toaster />
        {!hideChrome && <Header />}
        <Router />
        {showBottomNav && <TeamPortalBottomNav />}
        {!isAdminPage && !isClientAuthPage && !isTeamPortalPage && <ChatWidgetWithClientInfo />}
        {!hideChrome && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
