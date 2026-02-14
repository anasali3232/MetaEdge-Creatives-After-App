import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Briefcase, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { projects } from "@/data/portfolio";

interface ServicePortfolioProps {
  category: string;
  title?: string;
  subtitle?: string;
}

export default function ServicePortfolio({ category, title, subtitle }: ServicePortfolioProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const filteredProjects = projects.filter(p => p.category === category);

  if (filteredProjects.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Our Work
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || "Featured Projects"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle || `Explore our recent ${category.toLowerCase()} projects and see the results we've delivered for our clients.`}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <Link href={`/portfolio/${project.slug}`}>
                <div
                  className="group relative bg-card border border-border rounded-md p-6 h-full hover-elevate cursor-pointer transition-all duration-300"
                  data-testid={`card-service-project-${project.slug}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5 line-clamp-3">
                    {project.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {project.highlights.slice(0, 2).map((highlight, i) => (
                      <div key={i} className="bg-muted/50 rounded-md px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-xs text-muted-foreground">{highlight.label}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{highlight.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-primary/5 text-primary/80 text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="text-center mt-12"
        >
          <Link href="/portfolio">
            <Button variant="outline" data-testid="button-view-all-projects">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
