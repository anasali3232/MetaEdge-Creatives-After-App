import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Bell, Globe } from "lucide-react";
import pageBg from "@/assets/bg-policy.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function PrivacyPolicy() {
  usePageMeta("privacy-policy");
  const sections = [
    {
      title: "Our Commitment to Privacy",
      icon: Shield,
      content: "At MetaEdge Creatives, we prioritize the privacy and security of our clients. We understand that your data is sensitive and valuable. We never compromise on privacy standards and ensure that all client information is handled with the utmost care and confidentiality."
    },
    {
      title: "Data Collection & Use",
      icon: Eye,
      content: "We collect only the information necessary to provide our premium services. This includes contact details and project-related data. We use this information solely to deliver measurable results and maintain clear communication throughout our partnership."
    },
    {
      title: "Client Confidentiality",
      icon: Lock,
      content: "Confidentiality is a cornerstone of our agency. We never share, sell, or disclose client data, internal systems, or intellectual property to unauthorized third parties. Your business secrets are safe with us."
    },
    {
      title: "Data Security",
      icon: Globe,
      content: "We implement robust cybersecurity protocols to protect your information. From encrypted communications to secure password management, we adhere to global standards like GDPR to ensure your digital assets remain protected."
    },
    {
      title: "Your Rights",
      icon: FileText,
      content: "You have the right to access, update, or request the deletion of your data at any time. We believe in complete transparency and are always ready to provide you with details on how your information is being managed."
    },
    {
      title: "Policy Updates",
      icon: Bell,
      content: "As we innovate and grow, we may update our privacy practices. We will always notify our clients of any significant changes to ensure you stay informed about our commitment to your privacy."
    }
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-20">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            How we protect and value your data at MetaEdge Creatives.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover-elevate"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{section.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
