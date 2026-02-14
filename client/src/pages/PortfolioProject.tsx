import { useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Target,
  Package,
  Cpu,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectBySlug } from "@/data/portfolio";
import CTA from "@/components/CTA";
import portfolioBg from "@/assets/bg-portfolio.webp";

export default function PortfolioProject() {
  const [, params] = useRoute("/portfolio/:slug");
  const slug = params?.slug || "";
  const project = getProjectBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  if (!project) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist.</p>
          <Link href="/portfolio">
            <Button data-testid="button-back-portfolio">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
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
          backgroundImage: `url(${portfolioBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
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
              <Link href="/portfolio" data-testid="link-back-portfolio">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Portfolio
                </span>
              </Link>

              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary"
              >
                <Briefcase className="w-4 h-4" />
                {project.category}
              </motion.span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight" data-testid="heading-project-title">
                <span className="text-primary">{project.title}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-project-summary">
                {project.summary}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" data-testid="button-project-contact">
                    Start Similar Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button size="lg" variant="outline" data-testid="button-view-all-projects">
                    View All Projects
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
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-6">Project Highlights</h3>
                <div className="grid grid-cols-2 gap-4">
                  {project.highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.15 + idx * 0.04 }}
                      className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100"
                      data-testid={`highlight-${idx}`}
                    >
                      <p className="text-2xl font-bold text-primary">{highlight.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{highlight.label}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-semibold tracking-wider uppercase text-sm mb-4 block text-primary"
              >
                Project Overview
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                About This <span className="text-primary">Project</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="text-muted-foreground leading-relaxed text-lg"
                data-testid="text-project-overview"
              >
                {project.overview}
              </motion.p>
            </div>

            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-semibold tracking-wider uppercase text-sm mb-4 block text-primary"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Tech Stack
                </div>
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Technologies <span className="text-primary">Used</span>
              </motion.h2>
              <div className="flex flex-wrap gap-3">
                {project.techStack.map((tech, idx) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-medium text-sm border border-primary/10"
                    data-testid={`tech-badge-${idx}`}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
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
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Key <span className="text-primary">Features</span> & Capabilities
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                data-testid={`feature-card-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{feature}</p>
                </div>
              </motion.div>
            ))}
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
              <div className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Deliverables
              </div>
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What We <span className="text-primary">Delivered</span>
            </motion.h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {project.deliverables.map((deliverable, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                data-testid={`deliverable-${idx}`}
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-muted-foreground">{deliverable}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />

      </div>
    </div>
  );
}
