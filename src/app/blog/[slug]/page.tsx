import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, getPostBySlug } from "@/data/blog";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const dateFormatted = new Date(post.date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="pt-24 md:pt-28 pb-20">
      <div className="relative h-[40vh] min-h-[280px] max-h-[420px]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Tutti gli articoli
            </Link>
            <p className="text-bronze-300 text-sm uppercase tracking-wider mb-2">
              {post.category} · {dateFormatted} · {post.readTime}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-12">
        <p className="text-lg text-warmgray-600 leading-relaxed border-b border-warmgray-100 pb-8 mb-10">
          {post.excerpt}
        </p>
        <div className="space-y-6 text-charcoal-700 leading-relaxed text-base md:text-lg">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-14 rounded-sm bg-warmgray-50 border border-warmgray-100 p-8 text-center">
          <h2 className="font-serif text-2xl text-charcoal font-semibold">
            Hai un progetto in mente?
          </h2>
          <p className="mt-2 text-warmgray-600">
            Sopralluogo gratuito a Milano e provincia. Ti rispondiamo entro 24 ore lavorative.
          </p>
          <Link
            href="/#contatti"
            className="mt-6 inline-flex items-center justify-center rounded-sm bg-bronze px-6 py-3 text-sm font-semibold text-white hover:bg-bronze-600 transition"
          >
            Richiedi un sopralluogo
          </Link>
        </div>
      </div>
    </article>
  );
}
