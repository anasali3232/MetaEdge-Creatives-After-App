import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import CTA from "@/components/CTA";
import portfolioBg from "@/assets/bg-portfolio.webp";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("###### ")) {
        elements.push(
          <h6 key={i} className="text-sm font-bold mt-4 mb-2 text-foreground">
            {renderInlineFormatting(line.replace("###### ", ""))}
          </h6>
        );
      } else if (line.startsWith("##### ")) {
        elements.push(
          <h5 key={i} className="text-base font-bold mt-5 mb-2 text-foreground">
            {renderInlineFormatting(line.replace("##### ", ""))}
          </h5>
        );
      } else if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={i} className="text-lg font-bold mt-6 mb-3 text-foreground">
            {renderInlineFormatting(line.replace("#### ", ""))}
          </h4>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-xl font-bold mt-8 mb-3 text-foreground">
            {renderInlineFormatting(line.replace("### ", ""))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-foreground">
            {renderInlineFormatting(line.replace("## ", ""))}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-3xl font-bold mt-10 mb-4 text-foreground">
            {renderInlineFormatting(line.replace("# ", ""))}
          </h1>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
          listItems.push(lines[i].replace(/^[-*]\s/, ""));
          i++;
        }
        elements.push(
          <ul key={`list-${i}`} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        continue;
      } else if (line.startsWith("![image](")) {
        const url = line.match(/\((.*?)\)/)?.[1];
        if (url) {
          elements.push(
            <img 
              key={i} 
              src={url} 
              alt="blog content" 
              loading="lazy"
              decoding="async"
              className="rounded-xl my-6 w-full max-h-[400px] object-cover border border-gray-100 shadow-sm" 
            />
          );
        }
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-4" />);
      } else {
        elements.push(
          <p key={i} className="text-muted-foreground leading-relaxed mb-4">
            {renderInlineFormatting(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[.*?\]\(.*?\)|<u>.*?<\/u>)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return (
          <em key={i}>{part.slice(1, -1)}</em>
        );
      }
      if (part.startsWith("<u>") && part.endsWith("</u>")) {
        return (
          <u key={i}>{part.slice(3, -4)}</u>
        );
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  if (isLoading) {
    return (
      <div className="relative pt-20">
        <div className="max-w-4xl mx-auto px-4 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/4 mb-4" />
            <div className="h-12 bg-gray-100 rounded w-3/4 mb-6" />
            <div className="h-64 bg-gray-100 rounded-2xl mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="relative pt-20">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <Button data-testid="button-back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-20">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${portfolioBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
        }}
      />
      <div className="relative z-[1]">
        <section className="relative py-16 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/blog">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-6"
                  data-testid="button-back-blog"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {post.tags &&
                  post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold uppercase tracking-wider text-primary/80 bg-primary/5 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                data-testid="heading-blog-post"
              >
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {post.coverImage && (
          <section className="pb-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden"
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                  data-testid="img-blog-cover"
                />
              </motion.div>
            </div>
          </section>
        )}

        <section className="pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm"
              data-testid="blog-content"
            >
              {renderContent(post.content)}
            </motion.article>
          </div>
        </section>

        <CTA />
      </div>
    </div>
  );
}
