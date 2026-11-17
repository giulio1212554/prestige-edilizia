import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { services, getServiceBySlug } from "@/data/services";
import { ArrowLeft, Check } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.seoTitle, description: service.seoDescription };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <article className="pt-28 md:pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/#servizi" className="inline-flex items-center gap-2 text-sm text-warmgray-500 hover:text-bronze mb-8">
          <ArrowLeft className="h-4 w-4" /> Tutti i servizi
        </Link>
        <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">Servizio</p>
        <h1 className="font-serif text-3xl md:text-5xl text-charcoal font-semibold leading-tight">{service.title}</h1>
        <p className="mt-5 text-lg text-warmgray-600 leading-relaxed">{service.longDescription}</p>
        <div className="mt-12">
          <h2 className="font-serif text-2xl text-charcoal font-semibold mb-6">Cosa include</h2>
          <ul className="space-y-3">
            {service.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-bronze shrink-0 mt-0.5" />
                <span className="text-charcoal-700">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-14 rounded-sm bg-charcoal p-8 md:p-10 text-center text-white">
          <h3 className="font-serif text-2xl font-semibold">Vuoi saperne di più?</h3>
          <p className="mt-3 text-warmgray-300 max-w-lg mx-auto">Contattaci per un sopralluogo gratuito.</p>
          <Link href="/#contatti" className="mt-6 inline-flex items-center justify-center rounded-sm bg-bronze px-6 py-3 text-sm font-semibold text-white hover:bg-bronze-600 transition">
            Richiedi un sopralluogo
          </Link>
        </div>
      </div>
    </article>
  );
}
