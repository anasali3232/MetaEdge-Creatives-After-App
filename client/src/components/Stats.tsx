import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, TrendingUp, Zap, Award, Users, Clock } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { value: 252, suffix: "+", label: "Projects Delivered", icon: Award },
  { value: 220, suffix: "+", label: "Happy Clients", icon: Users },
  { value: 90, suffix: "%", label: "Client Satisfaction", icon: TrendingUp },
  { value: 10, suffix: "+", label: "Years Experience", icon: Clock },
  { value: 24, suffix: "/7", label: "Support Available", icon: Zap, static: "24/7" },
];

export default function Stats() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-20 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0 }}
            data-testid="text-badge-stats"
          >
            Our Impact
          </motion.span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="heading-stats">
            Proven Results in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Innovation
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative p-6 rounded-2xl bg-white border border-gray-100 text-center hover-elevate active-elevate-2 overflow-hidden group min-w-[160px] flex-1 sm:flex-none"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + index * 0.05 }}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1" data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {stat.static ? stat.static : <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />}
                </div>
                <div className="text-xs text-muted-foreground" data-testid={`stat-label-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
