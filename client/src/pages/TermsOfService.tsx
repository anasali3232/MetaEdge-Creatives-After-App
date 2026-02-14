import { motion } from "framer-motion";
import { FileCheck, Scaling, Clock, CreditCard, Scale, HeartHandshake } from "lucide-react";
import pageBg from "@/assets/bg-policy.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function TermsOfService() {
  usePageMeta("terms-of-service");
  const sections = [
    {
      title: "Service Agreement",
      icon: HeartHandshake,
      content: "By engaging MetaEdge Creatives, you agree to a partnership built on mutual respect and professional excellence. We provide premium creative and technical services tailored to your business goals."
    },
    {
      title: "Project Scope",
      icon: FileCheck,
      content: "Each project begins with a clear discovery phase. We define milestones, deliverables, and timelines to ensure transparency. Any changes to the scope will be discussed and agreed upon cross-departmentally."
    },
    {
      title: "Timelines & Delivery",
      icon: Clock,
      content: "We respect your time. While we strive to meet every deadline, project speed depends on timely feedback and content delivery from the client. We prioritize quality over excessive overtime."
    },
    {
      title: "Pricing & Payments",
      icon: CreditCard,
      content: "Our pricing reflects the value and expertise we bring to your brand. Custom quotes are provided after understanding your requirements. Payments follow the agreed schedule in your specific proposal."
    },
    {
      title: "Intellectual Property",
      icon: Scale,
      content: "Upon final payment, the rights to the delivered creative assets are transferred to you. We maintain the right to showcase our work in our portfolio unless otherwise agreed in a confidentiality contract."
    },
    {
      title: "Scalability",
      icon: Scaling,
      content: "Our solutions are built to grow with you. Whether you're a startup or an established brand, our terms are designed to support your long-term success and growth goals."
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
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            The professional standards of our partnership.
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
