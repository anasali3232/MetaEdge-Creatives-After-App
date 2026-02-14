import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Briefcase,
  Filter,
  Code,
  ShoppingCart,
  Megaphone,
  Zap,
  Music,
  Globe,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { projects, categories } from "@/data/portfolio";
import CTA from "@/components/CTA";
import portfolioBg from "@/assets/bg-portfolio.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

const categoryIcons: Record<string, typeof Code> = {
  "Web Development": Code,
  "Custom CRM": Database,
  "Digital Marketing": Megaphone,
  "AI Automation": Zap,
  "Social Media": Music,
};

export default function PortfolioPage() {
  usePageMeta("portfolio");
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary"
          >
            <Briefcase className="w-4 h-4" />
            Our Portfolio
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            data-testid="heading-portfolio"
          >
            Projects We've{" "}
            <span className="text-primary">Delivered</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            data-testid="text-portfolio-subtitle"
          >
            From custom CRM systems to AI-powered calling solutions, explore our
            diverse portfolio of successful projects delivered across industries
            and platforms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/contact">
              <Button size="lg" data-testid="button-portfolio-contact">
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" data-testid="button-portfolio-services">
                Our Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-semibold tracking-wider uppercase text-sm mb-4 block text-primary"
            >
              Case Studies
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Featured <span className="text-primary">Projects</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Each project represents our commitment to quality, innovation, and delivering
              results that exceed expectations.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Button
              variant={activeCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("All")}
              data-testid="filter-all"
            >
              <Filter className="w-4 h-4 mr-1" />
              All Projects
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {cat}
              </Button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => {
              const CategoryIcon = categoryIcons[project.category] || Globe;
              return (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  layout
                >
                  <Link href={`/portfolio/${project.slug}`} data-testid={`link-project-${project.slug}`}>
                    <div
                      className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col"
                      data-testid={`project-card-${project.slug}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-105">
                          <CategoryIcon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary/80 bg-primary/5 px-3 py-1 rounded-full">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors" data-testid={`text-project-title-${project.slug}`}>
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                        {project.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(0, 4).map(tech => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground">
                            +{project.techStack.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-primary text-sm font-medium mt-auto">
                        View Details
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}
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
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold"
            >
              Our <span className="text-primary">Process</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "We understand your goals, audience, and requirements to build a solid foundation." },
              { step: "02", title: "Strategy", desc: "Our team designs a tailored approach and project roadmap aligned with your vision." },
              { step: "03", title: "Development", desc: "We bring your project to life with clean code, modern design, and best practices." },
              { step: "04", title: "Launch & Support", desc: "We deploy, test, and provide ongoing support to ensure everything runs smoothly." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
                data-testid={`process-step-${idx}`}
              >
                <span className="text-5xl font-black text-primary/10 absolute top-4 right-4">{item.step}</span>
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
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
