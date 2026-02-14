import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Users, Award, Target, Lightbulb } from "lucide-react";
import aboutOfficeImg from "@/assets/about-office.webp";
import AnimatedCounter from "@/components/AnimatedCounter";

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description: "Every project is designed to achieve measurable business outcomes.",
  },
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We leverage cutting-edge technologies to stay ahead of the curve.",
  },
  {
    icon: Users,
    title: "Client-Centric",
    description: "Your success is our priority. We build lasting partnerships.",
  },
  {
    icon: Award,
    title: "Quality Obsessed",
    description: "We never compromise on the quality of our deliverables.",
  },
];

const achievements = [
  "Custom solutions for every business",
  "Transparent communication always",
  "On-time project delivery",
  "Dedicated support team",
  "Scalable & future-proof solutions",
  "Competitive pricing",
];

export default function About() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-24 overflow-hidden"
    >
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0 }}
              data-testid="text-badge-about"
            >
              About Us
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight" data-testid="heading-about">
              Innovate, Create,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Elevate
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-about-description">
              At MetaEdge Creatives, we believe in the power of digital transformation. Our mission is to 
              help businesses thrive in the modern era through cutting-edge strategy and creative 
              excellence. We don't just build websites; we craft digital legacies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              {achievements.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  data-testid={`achievement-${index}`}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl group bg-gray-100">
              <img 
                src={aboutOfficeImg} 
                alt="MetaEdge Creatives Office" 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              
              {/* Floating Stats on Image */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white">
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={252} suffix="+" inView={isInView} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white">
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={220} suffix="+" inView={isInView} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">Happy Clients</div>
                </div>
              </div>
            </div>
            
            {/* Decorative background for image */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary/10 rounded-3xl" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
