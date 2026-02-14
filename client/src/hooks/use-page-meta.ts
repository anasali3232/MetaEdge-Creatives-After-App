import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PageMeta } from "@shared/schema";

export function usePageMeta(pageSlug: string) {
  const { data: meta } = useQuery<PageMeta | null>({
    queryKey: ["/api/page-meta", pageSlug],
    queryFn: async () => {
      const res = await fetch(`/api/page-meta/${encodeURIComponent(pageSlug)}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!meta) return;

    const originalTitle = document.title;

    if (meta.title || meta.metaTitle) {
      document.title = meta.metaTitle || meta.title || originalTitle;
    }

    const setMeta = (name: string, content: string | null) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setOg = (property: string, content: string | null) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", meta.metaDescription || meta.description);
    setMeta("keywords", meta.keywords);
    setOg("og:title", meta.metaTitle || meta.title);
    setOg("og:description", meta.metaDescription || meta.description);
    setOg("og:image", meta.ogImage);

    return () => {
      document.title = originalTitle;
    };
  }, [meta]);

  return meta;
}
