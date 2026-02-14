import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  MessageSquare,
  Building2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import pageBg from "@/assets/bg-contact.webp";
import { usePageMeta } from "@/hooks/use-page-meta";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TurnstileWidget from "@/components/TurnstileWidget";

const contactInfo = [
  {
    icon: SiWhatsapp,
    title: "WhatsApp",
    value: "+1 (307) 310-7196",
    link: "https://wa.me/13073107196",
    description: "Available for quick chat"
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (307) 310-7196",
    link: "tel:+13073107196",
    description: ""
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@metaedgecreatives.com",
    link: "mailto:info@metaedgecreatives.com",
    description: ""
  },
  {
    icon: MapPin,
    title: "Office",
    value: "312 W 2nd St Unit #A8985",
    subvalue: "Casper, WY 82601",
    link: "https://maps.google.com/?q=312+W+2nd+St+Casper+WY+82601",
    description: ""
  }
];

function ContactCard({ item, index }: { item: typeof contactInfo[0], index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.a
      href={item.link}
      target={item.link.startsWith("http") ? "_blank" : undefined}
      rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-8 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out hover:-translate-y-2 block"
      data-testid={`contact-card-${index}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: isHovered
            ? `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(350 78% 42% / 0.1), transparent 40%)`
            : 'none',
        }}
      />
      <div className="relative z-10">
        <div className="p-4 rounded-2xl bg-primary/5 w-fit mb-6 transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_hsl(350_78%_42%/0.25)]">
          <item.icon className="w-7 h-7 text-primary transition-transform duration-500 group-hover:scale-110" />
        </div>
        <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
        <p className="text-foreground font-medium mb-1">{item.value}</p>
        {item.subvalue && <p className="text-foreground font-medium mb-1">{item.subvalue}</p>}
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
    </motion.a>
  );
}

export default function ContactPage() {
  usePageMeta("contact");
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isFormInView = useInView(formRef, { once: true, margin: "-50px" });
  const { toast } = useToast();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  
  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const response = await apiRequest("POST", "/api/contact", { ...data, turnstileToken });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      form.reset();
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly via email.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertContactMessage) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${pageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />
      <div className="relative z-[1]">
      <section ref={heroRef} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Get In Touch
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Let's Start Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Digital Journey
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Ready to transform your business? Get in touch with our team and let's discuss how we can help you achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, idx) => (
              <ContactCard key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section ref={formRef} className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isFormInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <MessageSquare className="w-3 h-3" />
                Send Us a Message
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                We'd Love to Hear <span className="text-primary">From You</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Whether you have a question about our services, pricing, or just want to say hello, our team is ready to answer all your questions.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/5">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Quick Response</h4>
                    <p className="text-sm text-muted-foreground">We respond to all inquiries within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/5">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Free Consultation</h4>
                    <p className="text-sm text-muted-foreground">Get a free strategy session with our experts</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isFormInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.05 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 lg:p-10 rounded-3xl bg-gray-50/80 border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Full Name <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="John Doe"
                                className="pl-10 bg-white border-gray-200 focus:border-primary"
                                data-testid="input-name"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Email Address <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="john@example.com"
                                className="pl-10 bg-white border-gray-200 focus:border-primary"
                                data-testid="input-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="pl-10 bg-white border-gray-200 focus:border-primary"
                                data-testid="input-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Company Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Your Company"
                                className="pl-10 bg-white border-gray-200 focus:border-primary"
                                data-testid="input-company"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="text-sm font-medium">Subject</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="How can we help you?"
                            className="bg-white border-gray-200 focus:border-primary"
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="mb-8">
                        <FormLabel className="text-sm font-medium">
                          Message <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us about your project, goals, and timeline..."
                            className="min-h-[150px] bg-white border-gray-200 focus:border-primary resize-none"
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <TurnstileWidget key={turnstileKey} onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken("")} />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full hover-elevate active-elevate-2"
                    disabled={contactMutation.isPending || !turnstileToken}
                    data-testid="button-submit-contact"
                  >
                    {contactMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground mb-3">Or schedule a free consultation call</p>
                    <a href="https://calendly.com/metaedgecreatives-info/30min" target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="outline" size="lg" className="w-full hover-elevate active-elevate-2">
                        <span className="flex items-center gap-2">
                          Book a Consultation
                          <Calendar className="w-4 h-4" />
                        </span>
                      </Button>
                    </a>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 text-center overflow-hidden shadow-[0_20px_50px_rgba(196,30,58,0.15)] ring-1 ring-primary/5"
          >
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-primary/20" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 flex-wrap px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Prefer a Quick Call?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            >
              Schedule a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Free Consultation
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Book a 30-minute call with our team to discuss your project and get personalized recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
            >
              <a href="https://calendly.com/metaedgecreatives-info/30min" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="hover-elevate active-elevate-2 min-w-[200px]" data-testid="button-call-now">
                  <span className="flex items-center gap-2">
                    Book a Free Consultation
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </a>
              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                or email us at{" "}
                <a
                  href="mailto:info@metaedgecreatives.com"
                  className="font-medium text-primary hover:underline transition-all"
                >
                  info@metaedgecreatives.com
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap"
            >
              <span className="flex items-center gap-2 flex-wrap">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Trusted by 220+ Businesses
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                90% Client Satisfaction
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                252+ Projects Delivered
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}
