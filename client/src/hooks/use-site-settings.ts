import { useQuery } from "@tanstack/react-query";

const defaults: Record<string, string> = {
  phone: "+1 (307) 310-7196",
  email: "info@metaedgecreatives.com",
  address: "312 W 2nd St Unit #A8985 Casper, WY 82601",
  whatsapp: "+13073107196",
  company_name: "MetaEdge Creatives",
  tagline: "Innovate, Create, Elevate",
};

export function useSiteSettings() {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    staleTime: 60 * 1000,
  });

  const get = (key: string) => data?.[key] || defaults[key] || "";

  return { settings: data || defaults, get };
}
