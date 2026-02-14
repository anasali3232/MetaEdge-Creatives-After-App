import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import CTA from "@/components/CTA";
import { useState } from "react";
import portfolioBg from "@/assets/bg-portfolio.webp";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function BlogPage() {
  usePageMeta("blog");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${portfolioBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.2,
        }}
      />
      <div className="relative z-[1]">
        <section
          className="relative py-24 bg-gradient-to-b from-primary/5 via-transparent to-transparent overflow-hidden"
        >
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 text-primary"
            >
              <BookOpen className="w-4 h-4" />
              Our Blog
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              data-testid="heading-blog"
            >
              Insights & <span className="text-primary">Updates</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              data-testid="text-blog-subtitle"
            >
              Stay updated with the latest trends in web development, digital
              marketing, AI automation, and business growth strategies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="max-w-md mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary/40 transition-colors"
                data-testid="input-blog-search"
              />
            </motion.div>
          </div>
        </section>

        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-gray-100 animate-pulse"
                  >
                    <div className="h-48 bg-gray-100 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-6 bg-gray-100 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {searchQuery ? "No articles found" : "No blog posts yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term."
                    : "Check back soon for new articles and insights."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      data-testid={`link-blog-${post.slug}`}
                    >
                      <div
                        className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col"
                        data-testid={`card-blog-${post.slug}`}
                      >
                        {post.coverImage && (
                          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {post.tags &&
                            post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-semibold uppercase tracking-wider text-primary/80 bg-primary/5 px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>

                        <h3
                          className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2"
                          data-testid={`text-blog-title-${post.slug}`}
                        >
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center gap-2 text-primary text-sm font-medium">
                            Read More
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        <CTA />
      </div>
    </div>
  );
}
