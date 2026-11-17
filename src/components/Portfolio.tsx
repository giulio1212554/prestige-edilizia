"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { projects, categoryLabels, type ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";

const filters: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "appartamenti", label: "Appartamenti" },
  { value: "ville", label: "Ville" },
  { value: "nuove-costruzioni", label: "Nuove costruzioni" },
  { value: "commerciali", label: "Commerciali" },
];

export default function Portfolio() {
  const [active, setActive] = useState<ProjectCategory | "all">("all");
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="portfolio" className="py-20 md:py-28 bg-warmgray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">Portfolio</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
              Progetti selezionati
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActive(f.value)}
                className={cn(
                  "px-4 py-2 text-sm rounded-sm transition-colors font-medium",
                  active === f.value
                    ? "bg-charcoal text-white"
                    : "bg-white text-charcoal-600 hover:bg-warmgray-100 border border-warmgray-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  href={`/progetti/${project.slug}`}
                  className="group block overflow-hidden rounded-sm bg-white shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-bronze font-medium mb-1">
                      {categoryLabels[project.category]} · {project.location}
                    </p>
                    <h3 className="font-serif text-lg text-charcoal font-semibold group-hover:text-bronze transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-warmgray-500">
                      {project.sqm} mq · {project.year}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
