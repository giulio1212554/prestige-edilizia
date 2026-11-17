"use client";

import { useState } from "react";
import Link from "next/link";
import { company } from "@/data/company";
import { Calculator, ArrowRight } from "lucide-react";

type FinishLevel = "standard" | "medio" | "pregio";

const prices: Record<FinishLevel, { min: number; max: number; label: string }> = {
  standard: { min: 800, max: 1100, label: "Standard" },
  medio: { min: 1100, max: 1600, label: "Medio-alto" },
  pregio: { min: 1600, max: 2500, label: "Pregio / Lusso" },
};

export default function CalcolatorePage() {
  const [sqm, setSqm] = useState(100);
  const [level, setLevel] = useState<FinishLevel>("medio");
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const estimate = { min: sqm * prices[level].min, max: sqm * prices[level].max };
  const formatEuro = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const handleLead = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bronze/10 text-bronze mb-5">
            <Calculator className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">Calcolatore indicativo costi</h1>
          <p className="mt-3 text-warmgray-600 max-w-xl mx-auto">
            Stima orientativa del costo di una ristrutturazione completa al mq.
          </p>
        </div>
        <div className="rounded-sm border border-warmgray-200 bg-white p-6 md:p-8 shadow-sm space-y-8">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Superficie (mq)</label>
            <input type="range" min={40} max={400} step={5} value={sqm} onChange={(e) => setSqm(Number(e.target.value))} className="w-full accent-bronze" />
            <div className="flex justify-between text-sm text-warmgray-500 mt-1">
              <span>40 mq</span>
              <span className="font-semibold text-charcoal text-lg">{sqm} mq</span>
              <span>400 mq</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">Livello di finiture</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(prices) as FinishLevel[]).map((key) => (
                <button key={key} type="button" onClick={() => setLevel(key)}
                  className={`rounded-sm border px-4 py-3 text-sm font-medium transition ${
                    level === key ? "border-bronze bg-bronze/5 text-bronze" : "border-warmgray-200 text-charcoal-600"
                  }`}>
                  {prices[key].label}
                  <span className="block text-xs text-warmgray-500 mt-0.5">{prices[key].min}–{prices[key].max} €/mq</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-sm bg-warmgray-50 border border-warmgray-100 p-6 text-center">
            <p className="text-sm uppercase tracking-wider text-warmgray-500 mb-2">Stima indicativa</p>
            <p className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">
              {formatEuro(estimate.min)} – {formatEuro(estimate.max)}
            </p>
          </div>
          {!showLead && !submitted && (
            <button onClick={() => setShowLead(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-bronze px-6 py-3.5 text-sm font-semibold text-white hover:bg-bronze-600">
              Ricevi un preventivo personalizzato <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {showLead && !submitted && (
            <form onSubmit={handleLead} className="space-y-4 border-t border-warmgray-100 pt-6">
              <input type="text" required placeholder="Nome e cognome" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })}
                className="w-full rounded-sm border border-warmgray-200 px-4 py-3 text-sm focus:border-bronze focus:outline-none" />
              <input type="email" required placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })}
                className="w-full rounded-sm border border-warmgray-200 px-4 py-3 text-sm focus:border-bronze focus:outline-none" />
              <input type="tel" required placeholder="Telefono" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                className="w-full rounded-sm border border-warmgray-200 px-4 py-3 text-sm focus:border-bronze focus:outline-none" />
              <button type="submit" className="w-full rounded-sm bg-charcoal px-6 py-3.5 text-sm font-semibold text-white hover:bg-charcoal-800">
                Invia e richiedi contatto
              </button>
            </form>
          )}
          {submitted && (
            <div className="rounded-sm bg-bronze/10 border border-bronze/20 p-6 text-center">
              <p className="font-semibold text-charcoal">Richiesta inviata!</p>
              <p className="mt-1 text-sm text-warmgray-600">Ti contatteremo al più presto.</p>
            </div>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-warmgray-500">Calcolatore fornito da {company.name}</p>
      </div>
    </div>
  );
}
