"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { company } from "@/data/company";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

const workTypes = [
  "Appartamento completo",
  "Bagno",
  "Cucina",
  "Bagno + cucina",
  "Ristrutturazione parziale",
  "Nuova costruzione",
  "Altro",
];

const sqmOptions = ["Fino a 50", "50-80", "80-100", "100-150", "150-200", "Oltre 200"];
const budgetOptions = [
  "Fino a 15.000",
  "15.000 - 30.000",
  "30.000 - 50.000",
  "50.000 - 100.000",
  "Oltre 100.000",
  "Da definire",
];
const deadlineOptions = [
  "Entro 1 mese",
  "1-3 mesi",
  "3-6 mesi",
  "Oltre 6 mesi",
  "Flessibile",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    workType: "Appartamento completo",
    sqm: "",
    budget: "",
    deadline: "",
    urgent: false as boolean | null,
    description: "",
    privacy: false,
    marketing: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [accountCode, setAccountCode] = useState("");

  const set = (k: string, v: string | boolean | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (
      !form.name ||
      !form.phone ||
      !form.city ||
      !form.workType ||
      !form.sqm ||
      form.urgent === null ||
      !form.privacy
    )
      return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || `${form.phone.replace(/\s/g, "")}@cliente.local`,
          phone: form.phone,
          message:
            form.description ||
            `Richiesta preventivo: ${form.workType} · ${form.sqm} mq · ${form.city}`,
          type: "preventivo",
          details: {
            city: form.city,
            workType: form.workType,
            sqm: form.sqm,
            budget: form.budget,
            deadline: form.deadline,
            urgent: form.urgent,
            description: form.description,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("fail");
      setAccountCode(data.accountCode || "");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-lg border border-warmgray-200 bg-white px-4 py-3 text-charcoal placeholder:text-warmgray-400 focus:border-bronze focus:outline-none focus:ring-1 focus:ring-bronze";

  return (
    <section id="contatti" className="py-20 md:py-28 bg-warmgray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm uppercase tracking-[0.15em] text-bronze font-medium mb-3">
            Preventivo
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal">
            Richiedi un preventivo veloce
          </h2>
          <p className="mt-3 text-warmgray-600">
            Compila i campi: ti ricontattiamo su WhatsApp. Se hai fretta, scrivi
            direttamente.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-warmgray-600">
            <a href={`tel:${company.phoneRaw}`} className="inline-flex items-center gap-1.5 hover:text-bronze">
              <Phone className="h-4 w-4" /> {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1.5 hover:text-bronze">
              <Mail className="h-4 w-4" /> {company.email}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {company.address.city}
            </span>
          </div>
        </motion.div>

        {status === "success" ? (
          <div className="rounded-2xl bg-white border border-warmgray-200 p-10 text-center shadow-sm">
            <CheckCircle className="h-14 w-14 text-bronze mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-semibold text-charcoal">
              Richiesta inviata
            </h3>
            <p className="mt-2 text-warmgray-600">
              Abbiamo creato il tuo account cliente. Quando il preventivo sarà
              pronto lo troverai sul sito.
            </p>
            {accountCode && (
              <div className="mt-6 rounded-xl bg-charcoal text-white p-5">
                <p className="text-xs uppercase tracking-wider text-warmgray-400">
                  Codice account
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-wide">
                  {accountCode}
                </p>
                <Link
                  href={`/area-cliente?code=${accountCode}`}
                  className="mt-4 inline-block text-sm text-bronze-300 underline"
                >
                  Vai all&apos;area cliente →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white border border-warmgray-200 p-6 md:p-8 space-y-5 shadow-sm"
          >
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Nome e cognome *
              </label>
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Mario Rossi"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Telefono / WhatsApp *
                </label>
                <input
                  required
                  type="tel"
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="Es. 333 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="opzionale"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Città / indirizzo del lavoro *
              </label>
              <input
                required
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Milano, Via Roma 12"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Tipo di lavoro *
                </label>
                <select
                  required
                  className={inputCls}
                  value={form.workType}
                  onChange={(e) => set("workType", e.target.value)}
                >
                  {workTypes.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Metri quadri *
                </label>
                <select
                  required
                  className={inputCls}
                  value={form.sqm}
                  onChange={(e) => set("sqm", e.target.value)}
                >
                  <option value="">Seleziona...</option>
                  {sqmOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Budget indicativo
                </label>
                <select
                  className={inputCls}
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                >
                  <option value="">Seleziona...</option>
                  {budgetOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">
                  Entro quando ti serve *
                </label>
                <select
                  required
                  className={inputCls}
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                >
                  <option value="">Seleziona...</option>
                  {deadlineOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                È urgente? *
              </label>
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => set("urgent", v)}
                    className={`flex-1 rounded-lg border py-3 text-sm font-medium transition ${
                      form.urgent === v
                        ? "border-bronze bg-bronze/10 text-bronze"
                        : "border-warmgray-200 text-warmgray-600 hover:border-warmgray-300"
                    }`}
                  >
                    {v ? "Sì" : "No"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Descrizione del lavoro
              </label>
              <textarea
                rows={4}
                className={`${inputCls} resize-none`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Raccontaci cosa vuoi fare..."
              />
            </div>

            <div className="space-y-3 text-sm text-warmgray-600">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={form.privacy}
                  onChange={() => set("privacy", true)}
                  className="mt-1"
                />
                <span>
                  Ho letto l&apos;
                  <Link href="/privacy" className="text-bronze underline">
                    Informativa Privacy
                  </Link>{" "}
                  e acconsento al trattamento dei miei dati per ricevere il
                  preventivo *
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.marketing}
                  onChange={(e) => set("marketing", e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Acconsento a ricevere comunicazioni promozionali e offerte
                  (facoltativo)
                </span>
              </label>
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">
                Invio non riuscito. Riprova o chiamaci.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !form.privacy}
              className="w-full rounded-full bg-bronze py-3.5 text-sm font-semibold text-white hover:bg-bronze-600 disabled:opacity-50 transition"
            >
              {status === "loading" ? (
                "Invio in corso..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Invia richiesta di preventivo veloce <Send className="h-4 w-4" />
                </span>
              )}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
