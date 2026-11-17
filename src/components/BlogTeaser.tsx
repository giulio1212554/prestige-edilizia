"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blog";
import { ArrowRight } from "lucide-react";

export default function BlogTeaser() {
  return (
    <section className="py-20 md:py-28 bg-warmgray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
              Guide e approfondimenti
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">
              Dal cantiere al bonus
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-bronze hover:underline"
          >
            Vedi tutti gli articoli
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-sm bg-white overflow-hidden border border-warmgray-100 shadow-sm hover:shadow-md transition-shadow h-full"
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
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-serif text-lg text-charcoal font-semibold leading-snug group-hover:text-bronze transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-warmgray-600 line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
