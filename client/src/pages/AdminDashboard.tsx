import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { FileText, Briefcase, LogOut, Plus, LayoutDashboard, ArrowRight, Settings, Users, MessageSquare, UserCog, Loader2, Globe, Newspaper, TicketCheck, MessageCircle, ClipboardList, HelpCircle, CalendarDays, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-metaedge.webp";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import AdminLogin from "@/components/AdminLogin";
import AnimatedCounter from "@/components/AnimatedCounter";

function Dashboard({ token, user, onLogout, hasPermission, isSuperAdmin }: {
  token: string;
  user: { name: string; email: string; role: string; permissions: string[] };
  onLogout: () => void;
  hasPermission: (p: string) => boolean;
  isSuperAdmin: boolean;
}) {
  const [blogCount, setBlogCount] = useState<number | null>(null);
  const [careerCount, setCareerCount] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [newsletterCount, setNewsletterCount] = useState<number | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [ticketCount, setTicketCount] = useState<number | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [faqCount, setFaqCount] = useState<number | null>(null);
  const [leaveCount, setLeaveCount] = useState<number | null>(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);
  const { counts: notifCounts, totalAlerts } = useAdminNotifications(token);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    if (hasPermission("blog")) {
      fetch("/api/admin/blog", { headers })
        .then((r) => r.json())
        .then((data) => setBlogCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setBlogCount(0));
    }
    if (hasPermission("careers")) {
      fetch("/api/admin/careers", { headers })
        .then((r) => r.json())
        .then((data) => setCareerCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setCareerCount(0));
    }
    if (hasPermission("team")) {
      fetch("/api/admin/team", { headers })
        .then((r) => r.json())
        .then((data) => setTeamCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setTeamCount(0));
    }
    if (hasPermission("messages")) {
      fetch("/api/admin/contact-messages", { headers })
        .then((r) => r.json())
        .then((data) => setMessageCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setMessageCount(0));
    }
    if (isSuperAdmin) {
      fetch("/api/admin/users", { headers })
        .then((r) => r.json())
        .then((data) => setUserCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setUserCount(0));
    }
    if (hasPermission("settings")) {
      fetch("/api/admin/newsletter", { headers })
        .then((r) => r.json())
        .then((data) => setNewsletterCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setNewsletterCount(0));
    }
    if (hasPermission("clients")) {
      fetch("/api/admin/clients", { headers })
        .then((r) => r.json())
        .then((data) => setClientCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setClientCount(0));
    }
    if (hasPermission("tickets")) {
      fetch("/api/admin/tickets", { headers })
        .then((r) => r.json())
        .then((data) => setTicketCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setTicketCount(0));
    }
    if (hasPermission("applications")) {
      fetch("/api/admin/applications", { headers })
        .then((r) => r.json())
        .then((data) => setApplicationCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setApplicationCount(0));
    }
    if (hasPermission("faqs")) {
      fetch("/api/admin/faqs", { headers })
        .then((r) => r.json())
        .then((data) => setFaqCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setFaqCount(0));
    }
    if (hasPermission("team")) {
      fetch("/api/admin/leaves", { headers })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLeaveCount(data.length);
            setPendingLeaveCount(data.filter((l: any) => l.status === "pending").length);
          } else {
            setLeaveCount(0);
          }
        })
        .catch(() => setLeaveCount(0));
    }
  }, [token, hasPermission, isSuperAdmin]);

  const allSections = [
    {
      title: "Blog Posts",
      description: "Create, edit, and manage blog articles for your website.",
      icon: FileText,
      count: blogCount,
      countLabel: "Posts",
      href: "/admin/blog",
      color: "#C41E3A",
      permission: "blog",
      actions: [{ label: "Manage Posts", href: "/admin/blog" }],
    },
    {
      title: "Career Listings",
      description: "Add and manage job openings and career opportunities.",
      icon: Briefcase,
      count: careerCount,
      countLabel: "Positions",
      href: "/admin/careers",
      color: "#2563EB",
      permission: "careers",
      actions: [{ label: "Manage Careers", href: "/admin/careers" }],
    },
    {
      title: "Job Applications",
      description: "View and manage job applications submitted by candidates.",
      icon: ClipboardList,
      count: applicationCount,
      countLabel: "Applications",
      href: "/admin/applications",
      color: "#6366F1",
      permission: "applications",
      actions: [{ label: "View Applications", href: "/admin/applications" }],
    },
    {
      title: "Team Members",
      description: "Update team member info, photos, and roles.",
      icon: Users,
      count: teamCount,
      countLabel: "Members",
      href: "/admin/team",
      color: "#059669",
      permission: "team",
      actions: [{ label: "Manage Team", href: "/admin/team" }],
    },
    {
      title: "Form Submissions",
      description: "View and manage messages from the contact form.",
      icon: MessageSquare,
      count: messageCount,
      countLabel: "Messages",
      href: "/admin/messages",
      color: "#E67E22",
      permission: "messages",
      actions: [{ label: "View Messages", href: "/admin/messages" }],
      alertCount: notifCounts.unreadMessages,
    },
    {
      title: "Live Chat",
      description: "Chat with website visitors in real-time.",
      icon: MessageCircle,
      count: null,
      countLabel: "",
      href: "/admin/live-chat",
      color: "#10B981",
      permission: "messages",
      actions: [{ label: "Open Live Chat", href: "/admin/live-chat" }],
      alertCount: notifCounts.activeChatSessions,
    },
    {
      title: "Admin Users",
      description: "Create, manage, and set permissions for admin users.",
      icon: UserCog,
      count: userCount,
      countLabel: "Users",
      href: "/admin/users",
      color: "#DC2626",
      permission: "users",
      actions: [{ label: "Manage Users", href: "/admin/users" }],
    },
    {
      title: "Page Manager",
      description: "Edit page titles, meta descriptions, SEO settings, and more for any page.",
      icon: Globe,
      count: null,
      countLabel: "",
      href: "/admin/pages",
      color: "#0891B2",
      permission: "pages",
      actions: [{ label: "Manage Pages", href: "/admin/pages" }],
    },
    {
      title: "Newsletter",
      description: "View and manage newsletter email subscribers.",
      icon: Newspaper,
      count: newsletterCount,
      countLabel: "Subscribers",
      href: "/admin/newsletter",
      color: "#0EA5E9",
      permission: "settings",
      actions: [{ label: "View Subscribers", href: "/admin/newsletter" }],
    },
    {
      title: "Client Management",
      description: "View and manage client accounts, assign services.",
      icon: Users,
      count: clientCount,
      countLabel: "Clients",
      href: "/admin/clients",
      color: "#8B5CF6",
      permission: "clients",
      actions: [{ label: "Manage Clients", href: "/admin/clients" }],
    },
    {
      title: "Support Tickets",
      description: "View and respond to client support queries.",
      icon: TicketCheck,
      count: ticketCount,
      countLabel: "Tickets",
      href: "/admin/tickets",
      color: "#F59E0B",
      permission: "tickets",
      actions: [{ label: "View Tickets", href: "/admin/tickets" }],
      alertCount: notifCounts.openTickets,
    },
    {
      title: "FAQs",
      description: "Add, edit, reorder, and manage frequently asked questions.",
      icon: HelpCircle,
      count: faqCount,
      countLabel: "Questions",
      href: "/admin/faqs",
      color: "#14B8A6",
      permission: "faqs",
      actions: [{ label: "Manage FAQs", href: "/admin/faqs" }],
    },
    {
      title: "Leave Management",
      description: "View and approve or reject employee leave requests.",
      icon: CalendarDays,
      count: leaveCount,
      countLabel: "Requests",
      href: "/admin/leaves",
      color: "#D97706",
      permission: "team",
      actions: [{ label: "Manage Leaves", href: "/admin/leaves" }],
      alertCount: pendingLeaveCount,
    },
    {
      title: "Employee Reports",
      description: "View employee work hours, attendance, and leave reports with date range filtering.",
      icon: FileBarChart,
      count: null,
      countLabel: "",
      href: "/admin/reports",
      color: "#0D9488",
      permission: "team",
      actions: [{ label: "View Reports", href: "/admin/reports" }],
    },
    {
      title: "Site Settings",
      description: "Change contact info, social media links, and company details.",
      icon: Settings,
      count: null,
      countLabel: "",
      href: "/admin/settings",
      color: "#7C3AED",
      permission: "settings",
      actions: [{ label: "Edit Settings", href: "/admin/settings" }],
    },
  ];

  const sections = allSections.filter(s => hasPermission(s.permission));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="MetaEdge Creatives" className="h-14 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground" data-testid="heading-admin-dashboard">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">MetaEdge Creatives</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground hidden md:block" data-testid="text-admin-email">
              {user.name} ({user.role === "super_admin" ? "Super Admin" : "Admin"})
            </span>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="link-view-site">
                View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-dashboard-welcome">
              Welcome to MetaEdge Creatives
            </h2>
          </div>
          <p className="text-muted-foreground mb-10">Manage your website content from here.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`p-6 h-full flex flex-col hover-elevate transition-all duration-300 relative ${(section as any).alertCount > 0 ? "ring-2 ring-[#C41E3A]/20" : ""}`}>
                {(section as any).alertCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-[#C41E3A] text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg animate-pulse z-10">
                    {(section as any).alertCount}
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div
                    className="p-3 rounded-xl relative"
                    style={{ backgroundColor: `${section.color}15` }}
                  >
                    <section.icon
                      className="w-6 h-6"
                      style={{ color: section.color }}
                    />
                  </div>
                  {section.count !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground" data-testid={`text-count-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <AnimatedCounter value={section.count} duration={1500} />
                      </div>
                      <div className="text-xs text-muted-foreground">{section.countLabel}</div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`heading-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {section.title}
                  {(section as any).alertCount > 0 && (
                    <span className="ml-2 text-xs font-medium text-[#C41E3A]">
                      {(section as any).alertCount} new
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  {section.description}
                </p>

                <div className="flex flex-col gap-2">
                  {section.actions.map((action) => (
                    <Link key={action.label} href={action.href}>
                      <Button className="w-full justify-between" data-testid={`button-${action.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {action.label}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4" data-testid="heading-quick-actions">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {hasPermission("blog") && (
                <Link href="/admin/blog">
                  <Button variant="outline" size="sm" data-testid="button-quick-new-post">
                    <Plus className="w-4 h-4 mr-1" />
                    New Blog Post
                  </Button>
                </Link>
              )}
              {hasPermission("careers") && (
                <Link href="/admin/careers">
                  <Button variant="outline" size="sm" data-testid="button-quick-new-career">
                    <Plus className="w-4 h-4 mr-1" />
                    New Career Listing
                  </Button>
                </Link>
              )}
              {hasPermission("team") && (
                <Link href="/admin/team">
                  <Button variant="outline" size="sm" data-testid="button-quick-add-member">
                    <Users className="w-4 h-4 mr-1" />
                    Add Team Member
                  </Button>
                </Link>
              )}
              {hasPermission("messages") && (
                <Link href="/admin/messages">
                  <Button variant="outline" size="sm" data-testid="button-quick-messages">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    View Messages
                  </Button>
                </Link>
              )}
              {isSuperAdmin && (
                <Link href="/admin/users">
                  <Button variant="outline" size="sm" data-testid="button-quick-users">
                    <UserCog className="w-4 h-4 mr-1" />
                    Manage Users
                  </Button>
                </Link>
              )}
              {hasPermission("settings") && (
                <Link href="/admin/newsletter">
                  <Button variant="outline" size="sm" data-testid="button-quick-newsletter">
                    <Newspaper className="w-4 h-4 mr-1" />
                    Newsletter
                  </Button>
                </Link>
              )}
              {hasPermission("settings") && (
                <Link href="/admin/pages">
                  <Button variant="outline" size="sm" data-testid="button-quick-pages">
                    <Globe className="w-4 h-4 mr-1" />
                    Page Manager
                  </Button>
                </Link>
              )}
              {hasPermission("faqs") && (
                <Link href="/admin/faqs">
                  <Button variant="outline" size="sm" data-testid="button-quick-faqs">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Manage FAQs
                  </Button>
                </Link>
              )}
              {hasPermission("team") && (
                <Link href="/admin/leaves">
                  <Button variant="outline" size="sm" data-testid="button-quick-leaves">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Leave Requests
                  </Button>
                </Link>
              )}
              {hasPermission("team") && (
                <Link href="/admin/reports">
                  <Button variant="outline" size="sm" data-testid="button-quick-reports">
                    <FileBarChart className="w-4 h-4 mr-1" />
                    Employee Reports
                  </Button>
                </Link>
              )}
              {hasPermission("settings") && (
                <Link href="/admin/settings">
                  <Button variant="outline" size="sm" data-testid="button-quick-settings">
                    <Settings className="w-4 h-4 mr-1" />
                    Site Settings
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const { token, user, isLoading, login, logout, hasPermission, isSuperAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={logout}
      hasPermission={hasPermission}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
