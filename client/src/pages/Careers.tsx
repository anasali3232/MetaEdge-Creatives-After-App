import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Briefcase, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Career } from "@shared/schema";
import CTA from "@/components/CTA";
import portfolioBg from "@/assets/bg-portfolio.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function CareersPage() {
  usePageMeta("careers");
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const { data: jobs = [], isLoading } = useQuery<Career[]>({
    queryKey: ["/api/careers"],
  });

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${portfolioBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
        }}
      />
      <div className="relative z-[1]">
        <section
          ref={heroRef}
          className="relative py-16 bg-gradient-to-b from-primary/5 via-transparent to-transparent overflow-hidden"
        >
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
              Join Our Team
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              data-testid="heading-careers"
            >
              Career <span className="text-primary">Opportunities</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4"
              data-testid="text-careers-subtitle"
            >
              Be part of a dynamic team that's shaping the future of digital
              solutions. Explore our open positions and take the next step in
              your career.
            </motion.p>
          </div>
        </section>

        <section className="py-12 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-gray-100 animate-pulse"
                  >
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  No openings right now
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for new career opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      href={`/careers/${job.slug}`}
                      data-testid={`link-career-${job.slug}`}
                    >
                      <div
                        className="group relative p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                        data-testid={`card-career-${job.slug}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-primary/60" />
                                {job.type}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-primary/60" />
                                {job.location}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-primary text-sm font-medium shrink-0 mt-2 md:mt-0">
                            View Details
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/5 via-white to-primary/5 border border-primary/10 text-center"
            >
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">
                Don't see the right role?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We're always looking for talented individuals. Send us your CV
                and portfolio, and we'll reach out when the perfect opportunity
                arises.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                <a
                  href="mailto:info@metaedgecreatives.com"
                  className="text-primary font-medium hover:underline"
                  data-testid="link-careers-email"
                >
                  info@metaedgecreatives.com
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a
                  href="tel:+13073107196"
                  className="text-primary font-medium hover:underline"
                  data-testid="link-careers-phone"
                >
                  +1 (307) 310-7196
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <CTA />
      </div>
    </div>
  );
}
