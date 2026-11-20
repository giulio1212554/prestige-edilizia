"use client";

import { motion } from "framer-motion";
import { beforeAfterItems } from "@/data/before-after";
import BeforeAfterSlider from "./BeforeAfterSlider";

export default function BeforeAfter() {
  return (
    <section id="prima-dopo" className="py-20 md:py-28 bg-warmgray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
            Portfolio
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal">
            Prima e dopo
          </h2>
          <p className="mt-4 text-warmgray-600 leading-relaxed">
            Scorri il cursore per confrontare lo stato iniziale e il risultato
            finale dei nostri interventi.
          </p>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {beforeAfterItems.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white border border-warmgray-200 overflow-hidden shadow-sm"
            >
              <BeforeAfterSlider
                before={item.before}
                after={item.after}
                altBefore={`${item.title} - prima`}
                altAfter={`${item.title} - dopo`}
              />
              <div className="p-5">
                <span className="inline-block rounded-full bg-bronze/10 text-bronze text-[11px] font-semibold px-2.5 py-1 mb-2">
                  Immagine dimostrativa
                </span>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-warmgray-600">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-warmgray-500">
          Immagini dimostrative a scopo illustrativo: non ritraggono lavori reali.
        </p>
      </div>
    </section>
  );
}
