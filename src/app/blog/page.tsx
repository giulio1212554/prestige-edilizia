import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Guide e approfondimenti",
  description:
    "Articoli su costi di ristrutturazione, bonus edilizi e tempi di cantiere a Milano. Guide pratiche di Prestige Edilizia.",
};

export default function BlogPage() {
  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
            Blog
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
            Guide e approfondimenti
          </h1>
          <p className="mt-4 text-warmgray-600 text-lg">
            Costi, bonus e tempi: contenuti pratici per orientarti prima del cantiere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => {
            const dateFormatted = new Date(post.date).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-sm bg-white overflow-hidden border border-warmgray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-warmgray-500 mb-2">
                    <span className="uppercase tracking-wider text-bronze font-medium">
                      {post.category}
                    </span>
                    <span>·</span>
                    <span>{dateFormatted}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="font-serif text-xl text-charcoal font-semibold leading-snug group-hover:text-bronze transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-warmgray-600 line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
