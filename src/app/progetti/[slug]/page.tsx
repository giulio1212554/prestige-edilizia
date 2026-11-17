import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { projects, getProjectBySlug, categoryLabels } from "@/data/projects";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="pt-24 md:pt-28 pb-20">
      <div className="relative h-[50vh] min-h-[400px] max-h-[600px]">
        <Image src={project.coverImage} alt={project.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-5xl">
            <Link href="/#portfolio" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4" /> Torna ai progetti
            </Link>
            <p className="text-bronze-300 text-sm uppercase tracking-wider mb-2">
              {categoryLabels[project.category]} · {project.location} · {project.year}
            </p>
            <h1 className="font-serif text-3xl md:text-5xl text-white font-semibold">{project.title}</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-wrap gap-6 md:gap-10 border-b border-warmgray-200 pb-8 mb-10">
          <div><p className="text-xs uppercase tracking-wider text-warmgray-500">Metratura</p><p className="font-serif text-2xl text-charcoal font-semibold">{project.sqm} mq</p></div>
          <div><p className="text-xs uppercase tracking-wider text-warmgray-500">Durata</p><p className="font-serif text-2xl text-charcoal font-semibold">{project.durationMonths} mesi</p></div>
          <div><p className="text-xs uppercase tracking-wider text-warmgray-500">Anno</p><p className="font-serif text-2xl text-charcoal font-semibold">{project.year}</p></div>
        </div>
        <p className="text-lg text-charcoal-700 leading-relaxed mb-12">{project.longDescription}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
          {project.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-charcoal-700">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-bronze shrink-0" />{f}
            </li>
          ))}
        </ul>
        <div className="rounded-sm bg-warmgray-50 border border-warmgray-100 p-8 text-center">
          <h3 className="font-serif text-2xl text-charcoal font-semibold">Ti ispiriamo?</h3>
          <p className="mt-2 text-warmgray-600">Il sopralluogo è gratuito e senza impegno.</p>
          <Link href="/#contatti" className="mt-6 inline-flex items-center justify-center rounded-sm bg-bronze px-6 py-3 text-sm font-semibold text-white hover:bg-bronze-600 transition">
            Richiedi un sopralluogo
          </Link>
        </div>
      </div>
    </article>
  );
}
