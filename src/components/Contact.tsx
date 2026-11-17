"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { company } from "@/data/company";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", privacy: false });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message || !form.privacy) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
  };

  return (
    <section id="contatti" className="py-20 md:py-28 bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm uppercase tracking-[0.15em] text-bronze-300 font-medium mb-3">Contatti</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
              Richiedi un sopralluogo gratuito
            </h2>
            <p className="mt-4 text-warmgray-300 leading-relaxed">
              Compila il form o contattaci direttamente. Ti risponderemo entro 24 ore lavorative.
            </p>
            <div className="mt-10 space-y-5">
              <a href={`tel:${company.phoneRaw}`} className="flex items-center gap-4 text-warmgray-200 hover:text-bronze-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/5"><Phone className="h-5 w-5" /></div>
                <div><p className="text-xs uppercase tracking-wider text-warmgray-400">Telefono</p><p className="font-medium">{company.phone}</p></div>
              </a>
              <a href={`mailto:${company.email}`} className="flex items-center gap-4 text-warmgray-200 hover:text-bronze-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/5"><Mail className="h-5 w-5" /></div>
                <div><p className="text-xs uppercase tracking-wider text-warmgray-400">Email</p><p className="font-medium">{company.email}</p></div>
              </a>
              <div className="flex items-center gap-4 text-warmgray-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/5"><MapPin className="h-5 w-5" /></div>
                <div><p className="text-xs uppercase tracking-wider text-warmgray-400">Sede</p><p className="font-medium">{company.address.full}</p></div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center rounded-sm bg-white/5 border border-white/10 p-10 text-center">
                <CheckCircle className="h-14 w-14 text-bronze mb-4" />
                <h3 className="font-serif text-2xl font-semibold">Richiesta inviata</h3>
                <p className="mt-2 text-warmgray-300">Ti contatteremo al più presto per fissare il sopralluogo.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-sm bg-white/5 border border-white/10 p-7 md:p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-warmgray-200 mb-1.5">Nome e cognome *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-warmgray-500 focus:border-bronze focus:outline-none" placeholder="Mario Rossi" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-warmgray-200 mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-warmgray-500 focus:border-bronze focus:outline-none" placeholder="mario@email.it" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warmgray-200 mb-1.5">Telefono *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-warmgray-500 focus:border-bronze focus:outline-none" placeholder="+39 333 1234567" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warmgray-200 mb-1.5">Messaggio *</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-warmgray-500 focus:border-bronze focus:outline-none resize-none" placeholder="Descrivi il tuo progetto..." />
                </div>
                <div className="flex items-start gap-3">
                  <input id="privacy" type="checkbox" checked={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-white/5 text-bronze" />
                  <label htmlFor="privacy" className="text-sm text-warmgray-300">Acconsento al trattamento dei dati personali. *</label>
                </div>
                <button type="submit" disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-bronze px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-bronze-600 disabled:opacity-60">
                  {status === "loading" ? "Invio in corso..." : <>Invia richiesta <Send className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
