import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "wouter";
import {
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiTypescript,
  SiTailwindcss,
  SiFigma,
  SiAdobepremierepro,
  SiAdobephotoshop,
  SiWordpress,
  SiShopify,
  SiHubspot,
  SiMeta,
  SiGoogle,
  SiSlack,
  SiZapier,
  SiJavascript,
  SiHtml5,
  SiWix,
  SiSalesforce,
  SiAdobeillustrator,
} from "react-icons/si";
import { Bot } from "lucide-react";

import logoImage from "@/assets/logo-metaedge.webp";
import highLevelLogo from "@/assets/highlevel-logo.webp";
import ptclLogo from "../assets/ptcl-logo.webp";
import irsLogo from "../assets/irs-logo.webp";
import psebLogo from "../assets/pseb-logo.webp";
import microsoftLogo from "../assets/microsoft-logo.webp";

const technologies = [
  { icon: SiReact, name: "React JS", color: "#61DAFB", slug: "react" },
  { icon: () => <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 object-contain" />, name: "Microsoft", color: "#00A4EF", slug: "microsoft" },
  { icon: SiNextdotjs, name: "Next.js", color: "#000000", slug: "nextjs" },
  { icon: SiNodedotjs, name: "Node JS", color: "#339933", slug: "nodejs" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6", slug: "typescript" },
  { icon: SiTailwindcss, name: "Tailwind CSS", color: "#06B6D4", slug: "tailwind-css" },
  { icon: SiFigma, name: "Figma", color: "#F24E1E", slug: "figma" },
  { icon: SiAdobepremierepro, name: "Premiere Pro", color: "#9999FF", slug: "premiere-pro" },
  { icon: SiAdobephotoshop, name: "Photoshop", color: "#31A8FF", slug: "photoshop" },
  { icon: SiAdobeillustrator, name: "Illustrator", color: "#FF9A00", slug: "illustrator" },
  { icon: SiWordpress, name: "WordPress", color: "#21759B", slug: "wordpress" },
  { icon: SiShopify, name: "Shopify", color: "#7AB55C", slug: "shopify" },
  { icon: SiHubspot, name: "HubSpot", color: "#FF7A59", slug: "hubspot" },
  { icon: SiMeta, name: "Meta", color: "#0081FB", slug: "meta" },
  { icon: SiGoogle, name: "Google", color: "#4285F4", slug: "google" },
  { icon: SiSlack, name: "Slack", color: "#4A154B", slug: "slack" },
  { icon: SiZapier, name: "Zapier", color: "#FF4A00", slug: "zapier" },
  { icon: SiJavascript, name: "JavaScript", color: "#F7DF1E", slug: "javascript" },
  { icon: SiHtml5, name: "HTML 5", color: "#E34F26", slug: "html5" },
  { icon: SiWix, name: "Wix", color: "#000000", slug: "wix" },
  { icon: SiSalesforce, name: "Salesforce", color: "#00A1E0", slug: "salesforce" },
  { icon: () => <img src={highLevelLogo} alt="GoHighLevel" className="w-8 h-8 object-contain" />, name: "HighLevel", color: "#22ADFF", slug: "gohighlevel" },
  { icon: SiZapier, name: "n8n", color: "#FF6C37", slug: "n8n" },
  { icon: () => <img src={ptclLogo} alt="PTCL" className="w-8 h-8 object-contain" />, name: "PTCL", color: "#006837", slug: "ptcl" },
  { icon: () => <img src={irsLogo} alt="IRS" className="w-8 h-8 object-contain" />, name: "IRS", color: "#000000", slug: "irs" },
  { icon: () => <img src={psebLogo} alt="PSEB" className="w-8 h-8 object-contain" />, name: "PSEB", color: "#4B2E83", slug: "pseb" },
];

export default function TechStack() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="portfolio"
      ref={containerRef}
      className="relative py-12 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4"
            data-testid="text-badge-tech"
          >
            Technologies We Use
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6" data-testid="heading-tech-stack">
            Powered by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Modern Tools
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-tech-description">
            We leverage industry-leading technologies and platforms to deliver 
            exceptional results for our clients.
          </p>
        </div>

        <div className="relative overflow-hidden group/stack pt-10 pb-4">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-scroll w-max group-hover/stack:[animation-play-state:paused] px-4">
            <div className="flex gap-8 pr-8">
              {[...technologies, ...technologies].map((tech, index) => (
                <Link key={`${tech.name}-${index}`} href={`/platforms/${tech.slug}`}>
                  <div
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 min-w-[140px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] group/tech relative h-[140px] cursor-pointer animate-float"
                    style={{ animationDelay: `${index * 0.2}s` }}
                    data-testid={`tech-${tech.name.toLowerCase()}-${index}`}
                  >
                    <div
                      className="p-4 rounded-xl transition-all duration-500 group-hover/tech:-translate-y-4 group-hover/tech:scale-110 group-hover/tech:rotate-6"
                      style={{ backgroundColor: `${tech.color}10` }}
                    >
                      <tech.icon
                        className="w-8 h-8"
                        style={{ color: tech.color }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground opacity-0 group-hover/tech:opacity-100 transition-all duration-300 absolute bottom-6">
                      {tech.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
