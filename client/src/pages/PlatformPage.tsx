import { useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, ArrowLeft, Layers, Award, ShieldCheck, Users, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformBySlug } from "@/data/platforms";
import { usePageMeta } from "@/hooks/use-page-meta";
import CTA from "@/components/CTA";
import pageBg from "@/assets/bg-platform.webp";

export default function PlatformPage() {
  const [, params] = useRoute("/platforms/:slug");
  const slug = params?.slug || "";
  const platform = getPlatformBySlug(slug);
  usePageMeta(`platforms/${slug}`);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  if (!platform) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Platform Not Found</h1>
          <p className="text-muted-foreground mb-8">The platform you're looking for doesn't exist.</p>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${pageBg})`,
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
              <span
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = "/";
                  }
                }}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
                data-testid="link-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </span>

              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary"
              >
                <Layers className="w-4 h-4" />
                {platform.category}
              </motion.span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight" data-testid="heading-platform-name">
                <span className="text-primary">{platform.name}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-2 font-medium" data-testid="text-platform-tagline">{platform.tagline}</p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-platform-description">
                {platform.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started
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
                <div className="absolute -top-4 -right-4 p-4 rounded-2xl shadow-lg bg-white border border-gray-100">
                  {platform.icon ? (
                    <platform.icon className="w-8 h-8" style={{ color: platform.color }} />
                  ) : platform.image ? (
                    <img src={platform.image} alt={platform.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="font-bold text-lg" style={{ color: platform.color }}>{platform.name.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-6">Key Features</h3>
                <div className="space-y-4">
                  {platform.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.15 + idx * 0.08 }}
                      className="flex items-center gap-3"
                      data-testid={`feature-item-${idx}`}
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
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
              className="font-semibold tracking-wider uppercase text-sm mb-4 block text-primary"
            >
              Use Cases
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How We Use <span className="text-primary">{platform.name}</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platform.useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`usecase-card-${idx}`}
              >
                <div className="p-3 rounded-xl w-fit mb-4 transition-colors bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:transition-colors" style={{ color: undefined }}>
                  {useCase}
                </h3>
                <p className="text-sm text-muted-foreground">
                  We leverage {platform.name} to deliver exceptional results in {useCase.toLowerCase()}.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {slug === "microsoft" && (
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
              >
                Certified Excellence
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Our <span className="text-primary">Microsoft Certified</span> Expertise
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="text-muted-foreground max-w-2xl mx-auto text-lg"
              >
                Our team holds Microsoft certifications, ensuring that every solution we deliver meets the highest industry standards.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, title: "Certified Professionals", desc: "Our developers and engineers hold official Microsoft certifications across Azure, Dynamics 365, and Power Platform." },
                { icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "We implement Microsoft's security best practices including Azure AD, MFA, and compliance frameworks for every project." },
                { icon: Users, title: "Dedicated Microsoft Team", desc: "A specialized team focused exclusively on Microsoft technologies, staying current with the latest updates and features." },
                { icon: BadgeCheck, title: "Proven Track Record", desc: "Successfully delivered Microsoft ecosystem projects for businesses ranging from startups to large enterprises." },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 text-center"
                  data-testid={`cert-card-${idx}`}
                >
                  <div className="p-4 rounded-xl w-fit mx-auto mb-4 bg-primary/10">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {platform.relatedServices.length > 0 && (
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block"
              >
                Related Services
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Services Using <span className="text-primary">{platform.name}</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {platform.relatedServices.map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={`/services/${service.slug}`}>
                    <div
                      className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                      data-testid={`related-service-${idx}`}
                    >
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        Learn More
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />
      </div>
    </div>
  );
}
