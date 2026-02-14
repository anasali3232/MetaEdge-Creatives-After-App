import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Save, Settings, Phone, Mail, MapPin, Globe, MessageCircle, Share2, ShieldX, LogOut, Code2 } from "lucide-react";
import { SiLinkedin, SiInstagram, SiFacebook, SiTiktok, SiYoutube, SiX, SiPinterest, SiSnapchat, SiThreads } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "@/components/AdminLogin";

const contactFields = [
  { key: "company_name", label: "Company Name", icon: Globe, placeholder: "MetaEdge Creatives" },
  { key: "tagline", label: "Tagline", icon: Globe, placeholder: "Innovate, Create, Elevate" },
  { key: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (307) 310-7196" },
  { key: "email", label: "Email Address", icon: Mail, placeholder: "info@metaedgecreatives.com" },
  { key: "address", label: "Office Address", icon: MapPin, placeholder: "312 W 2nd St..." },
  { key: "whatsapp", label: "WhatsApp Number", icon: MessageCircle, placeholder: "+13073107196" },
];

const socialFields = [
  { key: "facebook", label: "Facebook", icon: SiFacebook, placeholder: "https://facebook.com/metaedgecreatives" },
  { key: "instagram", label: "Instagram", icon: SiInstagram, placeholder: "https://instagram.com/metaedgecreatives" },
  { key: "linkedin", label: "LinkedIn", icon: SiLinkedin, placeholder: "https://linkedin.com/company/metaedgecreatives" },
  { key: "tiktok", label: "TikTok", icon: SiTiktok, placeholder: "https://tiktok.com/@metaedgecreatives" },
  { key: "youtube", label: "YouTube", icon: SiYoutube, placeholder: "https://youtube.com/@metaedgecreatives" },
  { key: "twitter", label: "X (Twitter)", icon: SiX, placeholder: "https://x.com/metaedgecreatives" },
  { key: "pinterest", label: "Pinterest", icon: SiPinterest, placeholder: "https://pinterest.com/metaedgecreatives" },
  { key: "snapchat", label: "Snapchat", icon: SiSnapchat, placeholder: "https://snapchat.com/add/metaedgecreatives" },
  { key: "threads", label: "Threads", icon: SiThreads, placeholder: "https://threads.net/@metaedgecreatives" },
];

function SettingsEditor({ token }: { token: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Array<{ key: string; value: string }>) => {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value; });
        setValues(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast({ title: "Settings saved successfully" });
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-site-settings">Site Settings</h1>
              <p className="text-xs text-muted-foreground">Manage contact info & social links</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} data-testid="button-save-settings">
            <Save className="w-4 h-4 mr-1" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground" data-testid="heading-company-info">Company Information</h2>
                <p className="text-sm text-muted-foreground">Update your contact details</p>
              </div>
            </div>

            <div className="space-y-5">
              {contactFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <field.icon className="w-4 h-4 text-muted-foreground" />
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={values[field.key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    data-testid={`input-setting-${field.key}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground" data-testid="heading-social-links">Social Media Links</h2>
                <p className="text-sm text-muted-foreground">Add links to show icons in footer. Leave empty to hide.</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              {socialFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <field.icon className="w-4 h-4 text-muted-foreground" />
                    {field.label}
                  </label>
                  <input
                    type="url"
                    value={values[field.key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    data-testid={`input-setting-${field.key}`}
                  />
                  {values[field.key] && (
                    <span className="text-xs text-green-600 flex items-center gap-1">Active - will show in footer</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Code2 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Tracking & Analytics Scripts</h2>
                <p className="text-sm text-muted-foreground">Add Google Tag Manager, Facebook Pixel, and other tracking codes</p>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">HEAD</span>
                  Google Tag Manager - Head Code
                </label>
                <p className="text-xs text-muted-foreground">Paste the GTM {'<script>'} tag that goes inside {'<head>'}. You get this from Google Tag Manager.</p>
                <textarea
                  value={values["gtm_head"] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, gtm_head: e.target.value }))}
                  placeholder={'<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){...})(window,document,\'script\',\'dataLayer\',\'GTM-XXXX\');</script>\n<!-- End Google Tag Manager -->'}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50"
                />
                {values["gtm_head"] && <span className="text-xs text-green-600 flex items-center gap-1">Active - injected in {'<head>'}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">BODY</span>
                  Google Tag Manager - Body Code (noscript)
                </label>
                <p className="text-xs text-muted-foreground">Paste the GTM {'<noscript>'} tag that goes right after opening {'<body>'}. You get this from Google Tag Manager.</p>
                <textarea
                  value={values["gtm_body"] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, gtm_body: e.target.value }))}
                  placeholder={'<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" ...></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->'}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50"
                />
                {values["gtm_body"] && <span className="text-xs text-green-600 flex items-center gap-1">Active - injected after {'<body>'}</span>}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">HEAD</span>
                    Facebook Pixel Code
                  </label>
                  <p className="text-xs text-muted-foreground">Paste your Facebook Pixel {'<script>'} code. You get this from Facebook Events Manager.</p>
                  <textarea
                    value={values["fb_pixel"] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, fb_pixel: e.target.value }))}
                    placeholder={"<!-- Facebook Pixel Code -->\n<script>!function(f,b,e,v,n,t,s){...}('https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', 'YOUR_PIXEL_ID');\nfbq('track', 'PageView');</script>\n<!-- End Facebook Pixel Code -->"}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50"
                  />
                  {values["fb_pixel"] && <span className="text-xs text-green-600 flex items-center gap-1">Active - injected in {'<head>'}</span>}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">HEAD</span>
                    Other Tracking Scripts (Head)
                  </label>
                  <p className="text-xs text-muted-foreground">Any additional tracking scripts for {'<head>'} (Google Analytics, Hotjar, etc.)</p>
                  <textarea
                    value={values["custom_head_scripts"] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, custom_head_scripts: e.target.value }))}
                    placeholder="Paste any additional tracking scripts here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50"
                  />
                  {values["custom_head_scripts"] && <span className="text-xs text-green-600 flex items-center gap-1">Active - injected in {'<head>'}</span>}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminSettings() {
  const { token, user, isLoading, login, logout, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={login} />;
  }

  if (!hasPermission("settings")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2" data-testid="heading-access-denied">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">You don't have permission to access site settings.</p>
          <div className="flex flex-col gap-2">
            <Link href="/admin">
              <Button variant="outline" className="w-full" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="ghost" onClick={logout} className="w-full" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <SettingsEditor token={token} />;
}
