"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Key,
  Home,
  Building2,
  Zap,
  PenTool,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { services } from "@/data/services";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key,
  Home,
  Building2,
  Zap,
  PenTool,
  FileCheck,
};

export default function Services() {
  return (
    <section id="servizi" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
            Cosa facciamo
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
            Servizi completi per ogni fase del progetto
          </h2>
          <p className="mt-4 text-warmgray-600 text-lg leading-relaxed">
            Dalla prima idea alla consegna delle chiavi, un team unico gestisce
            ogni aspetto con metodo e competenza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] || Home;
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/servizi/${service.slug}`}
                  className="group block h-full rounded-sm border border-warmgray-100 bg-warmgray-50/50 p-7 transition-all hover:border-bronze/40 hover:shadow-lg hover:shadow-bronze/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-bronze/10 text-bronze mb-5 group-hover:bg-bronze group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal font-semibold mb-2 group-hover:text-bronze transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-warmgray-600 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-bronze">
                    Scopri di più
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
