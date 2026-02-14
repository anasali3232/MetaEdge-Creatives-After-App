import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function WhatsAppWidget() {
  const { get } = useSiteSettings();
  const phoneNumber = get("whatsapp").replace(/[\s+()-]/g, "");
  const message = "Hi MetaEdge Creatives, I'd like to discuss a project.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -5 }}
      data-testid="whatsapp-widget"
    >
      <SiWhatsapp className="w-8 h-8" />
      <span className="absolute -top-2 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    </motion.a>
  );
}
