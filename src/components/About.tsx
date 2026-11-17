"use client";

import { motion } from "framer-motion";
import { company } from "@/data/company";
import { Shield, Award, Users, Heart } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Solidità",
    text: "Strutture, contratti e garanzie chiare. Lavoriamo per costruire fiducia nel tempo.",
  },
  {
    icon: Award,
    title: "Competenza",
    text: "Team qualificati, certificazioni SOA e ISO, aggiornamento continuo su tecniche e normative.",
  },
  {
    icon: Users,
    title: "Ascolto",
    text: "Ogni progetto nasce dalle esigenze del cliente. Ascoltiamo prima di proporre.",
  },
  {
    icon: Heart,
    title: "Cura",
    text: "Dettaglio, finiture e rispetto dei tempi. La qualità si vede nei piccoli gesti.",
  },
];

export default function About() {
  return (
    <section id="chi-siamo" className="py-20 md:py-28 bg-warmgray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
              Chi siamo
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold leading-tight">
              {company.name}: eccellenza costruttiva dal 2004
            </h2>
            <p className="mt-5 text-warmgray-600 leading-relaxed">
              Siamo un&apos;impresa edile di fascia alta con sede a Milano, specializzata
              in ristrutturazioni chiavi in mano e nuove costruzioni residenziali di pregio.
              Il nostro approccio unisce solidità tecnica, attenzione al design e un
              servizio orientato al cliente.
            </p>
            <p className="mt-4 text-warmgray-600 leading-relaxed">
              Operiamo principalmente a Milano e provincia, con interventi selezionati
              anche in Lombardia. Ogni cantiere è seguito da un responsabile dedicato
              e da un team di artigiani e professionisti di fiducia.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {company.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center rounded-sm border border-bronze/30 bg-bronze/5 px-3 py-1.5 text-xs font-medium text-bronze-700"
                >
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-sm bg-white p-6 border border-warmgray-100 shadow-sm"
              >
                <v.icon className="h-7 w-7 text-bronze mb-3" />
                <h3 className="font-serif text-lg text-charcoal font-semibold mb-1">
                  {v.title}
                </h3>
                <p className="text-sm text-warmgray-600 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
