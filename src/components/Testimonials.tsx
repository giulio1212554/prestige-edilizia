"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14 text-center mx-auto">
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">Dicono di noi</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">
            La fiducia dei nostri clienti
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-sm border border-warmgray-100 bg-warmgray-50/60 p-7"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-bronze text-bronze" />
                ))}
              </div>
              <p className="text-charcoal-700 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <footer className="mt-5">
                <p className="font-semibold text-charcoal">{t.name}</p>
                <p className="text-sm text-warmgray-500">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
