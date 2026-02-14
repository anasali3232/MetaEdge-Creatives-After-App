import { motion, useInView } from "framer-motion";
import { Briefcase, Users, Zap, ShieldCheck, Target, Lightbulb, Clock } from "lucide-react";
import { useRef } from "react";
import pageBg from "@/assets/bg-policy.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function WorkspacePolicy() {
  usePageMeta("workspace-policy");
  const policies = [
    {
      id: "1",
      title: "Professional Conduct & Ethics",
      icon: Users,
      content: "We expect all employees to act with integrity, honesty, and respect. Harassment, discrimination, and workplace bullying are strictly prohibited. Confidentiality of client data and internal systems is mandatory."
    },
    {
      id: "2",
      title: "Work Hours & Flexibility",
      icon: Clock,
      content: "We support flexible working arrangements, including hybrid and remote options. Employees manage schedules responsibly to meet deadlines while maintaining work-life balance."
    },
    {
      id: "3",
      title: "Collaboration & Communication",
      icon: Zap,
      content: "Open and respectful communication is part of our culture. Teams collaborate cross-departmentally across Dev, AI, CRM, and Marketing using structured workflows."
    },
    {
      id: "4",
      title: "Data Security & Privacy",
      icon: ShieldCheck,
      content: "Strict adherence to cybersecurity protocols. Employees comply with GDPR, CCPA, and internal privacy standards. Sensitive information is never shared outside authorized channels."
    },
    {
      id: "5",
      title: "Performance & Growth",
      icon: Target,
      content: "We maintain a results-driven environment with clear KPIs. Continuous learning is encouraged through training, certifications, and skill development."
    },
    {
      id: "6",
      title: "Innovation & Culture",
      icon: Lightbulb,
      content: "We foster a positive, creative, and solution-oriented atmosphere. Innovation, ownership, and teamwork are our core values. Feedback is encouraged and respected."
    },
    {
      id: "7",
      title: "Workspace Guidelines",
      icon: Clock,
      content: "Respect designated quiet hours and shared spaces. Maintain a clean and organized workstation. Ensure that meetings and discussions are conducted professionally without disrupting others."
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
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Our Culture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Workspace <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At MetaEdge Creatives Pakistan, we are committed to creating a productive, inclusive, and growth-focused environment where every team member can thrive.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {policies.map((policy, idx) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover-elevate"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <policy.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{policy.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{policy.content}</p>
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
