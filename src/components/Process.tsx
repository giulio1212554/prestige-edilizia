"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/data/process";

export default function Process() {
  return (
    <section id="processo" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16 text-center mx-auto">
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
            Il nostro metodo
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-semibold leading-tight">
            Cinque passi verso la tua nuova casa
          </h2>
          <p className="mt-4 text-warmgray-600 text-lg">
            Un percorso chiaro, trasparente e accompagnato in ogni fase.
          </p>
        </div>

        <div className="relative">
          {/* Line connector - desktop */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-warmgray-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-bronze bg-white text-bronze font-serif text-xl font-semibold relative z-10">
                  {step.number}
                </div>
                <h3 className="mt-5 font-serif text-lg text-charcoal font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-warmgray-600 leading-relaxed px-2">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
