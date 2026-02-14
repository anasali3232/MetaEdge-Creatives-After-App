import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  SiAmazonwebservices,
  SiGoogle,
  SiAdobe,
  SiSalesforce,
  SiCoursera,
  SiAndroidstudio,
} from "react-icons/si";

import ptclLogo from "../assets/ptcl-logo.webp";
import irsLogo from "../assets/irs-logo.webp";
import psebLogo from "../assets/pseb-logo.webp";
import microsoftLogo from "../assets/microsoft-logo.webp";
import wyomingLogo from "../assets/wyoming-logo-transparent.webp";
import designrushLogo from "../assets/designrush-logo.webp";
import techbehemothsLogo from "../assets/techbehemoths-logo.webp";
import goodfirmsLogo from "../assets/goodfirms-icon.webp";

const companies = [
  { icon: SiAmazonwebservices, name: "AWS", color: "#FF9900", slug: "aws" },
  { icon: () => <img src={microsoftLogo} alt="Microsoft" className="w-8 h-8 object-contain" />, name: "Microsoft", color: "#00A4EF", slug: "microsoft-dynamics" },
  { icon: SiGoogle, name: "Google", color: "#4285F4", slug: "google" },
  { icon: () => <img src={psebLogo} alt="PSEB" className="w-8 h-8 object-contain" />, name: "PSEB", color: "#4B2E83", slug: "pseb" },
  { icon: () => <img src={designrushLogo} alt="DesignRush" className="w-8 h-8 object-contain" />, name: "DesignRush", color: "#0D47A1", slug: "designrush" },
  { icon: () => <img src={techbehemothsLogo} alt="TechBehemoths" className="w-8 h-8 object-contain" />, name: "TechBehemoths", color: "#212121", slug: "techbehemoths" },
  { icon: () => <img src={goodfirmsLogo} alt="GoodFirms" className="w-8 h-8 object-contain" />, name: "GoodFirms", color: "#1F70B1", slug: "goodfirms" },
  { icon: () => <img src={wyomingLogo} alt="Wyoming State" className="w-8 h-8 object-contain" />, name: "Wyoming State", color: "#212121", slug: "wyoming-state" },
  { icon: () => <img src={irsLogo} alt="IRS" className="w-8 h-8 object-contain" />, name: "IRS", color: "#000000", slug: "irs" },
  { icon: SiAdobe, name: "Adobe", color: "#FF0000", slug: "adobe" },
  { icon: SiSalesforce, name: "Salesforce", color: "#00A1E0", slug: "salesforce" },
  { icon: SiCoursera, name: "Coursera", color: "#0056D2", slug: "coursera" },
  { icon: () => <img src={ptclLogo} alt="PTCL" className="w-8 h-8 object-contain" />, name: "PTCL", color: "#006837", slug: "ptcl" },
  { icon: SiAndroidstudio, name: "Android Studio", color: "#3DDC84", slug: "android-studio" },
];

export default function CompanyLogos() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-12 overflow-hidden"
      data-testid="section-company-logos"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0 }}
            data-testid="text-badge-partners"
          >
            Our Partners
          </motion.span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            data-testid="heading-company-logos"
          >
            Trusted By{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Industry Leaders
            </span>
          </h2>
        </motion.div>

        <div className="relative overflow-hidden group/logos pt-10 pb-4">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex animate-scroll w-max group-hover/logos:[animation-play-state:paused] px-4">
            <div className="flex gap-8 pr-8">
              {[...companies, ...companies].map((company, index) => {
                const content = (
                  <div
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 min-w-[150px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] group/logo relative h-[130px] animate-float ${company.slug ? 'cursor-pointer' : ''}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                    data-testid={`logo-${company.name.toLowerCase().replace(/\s+/g, "-")}-${index}`}
                  >
                    <div
                      className="p-3 rounded-xl transition-all duration-500 group-hover/logo:-translate-y-4 group-hover/logo:scale-110 group-hover/logo:rotate-6"
                      style={{ backgroundColor: `${company.color}10` }}
                    >
                      {company.icon ? (
                        <company.icon
                          className="w-10 h-10"
                          style={{ color: company.color }}
                        />
                      ) : (
                        <span
                          className="text-sm font-bold whitespace-nowrap"
                          style={{ color: company.color }}
                        >
                          {company.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground opacity-0 group-hover/logo:opacity-100 transition-all duration-300 absolute bottom-6">
                      {company.name}
                    </span>
                  </div>
                );

                return company.slug ? (
                  <Link key={`${company.name}-${index}`} href={`/platforms/${company.slug}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={`${company.name}-${index}`}>{content}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
