"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  listLeads,
  listDocs,
  updateLead,
  addDoc,
  unreadCount,
  getLead,
  type Lead,
  type Document,
} from "@/lib/client-db";
import { downloadDocumentPdf } from "@/lib/pdf";
import FiscalPanel from "@/components/FiscalPanel";

const PASSWORD = "admin2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [tab, setTab] = useState<"leads" | "docs" | "fiscale">("leads");
  const [quoteForm, setQuoteForm] = useState({
    title: "Preventivo ristrutturazione",
    notes:
      "Validita 30 giorni. Importi IVA esclusa (aliquota 10% in fattura per ristrutturazione residenziale).",
    lines:
      "Demolizioni selettive e smaltimento;3200\nImpianto idraulico completo;4800\nImpianto elettrico a norma CEI;3600\nPosa rivestimenti e pavimenti;7200\nSanitari e rubinetteria;5200\nManodopera e direzione lavori;2000",
    vatRate: "10",
    send: true,
  });
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const l = listLeads();
    setLeads(l);
    setUnread(unreadCount());
    setDocs(listDocs());
    if (selected) {
      setSelected(l.find((x) => x.id === selected.id) || null);
    }
  }, [selected]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("pe-admin") === "1") {
      setAuthed(true);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authed) return;
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    const t = setInterval(refresh, 2500);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, [authed, refresh]);

  const login = (e: FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem("pe-admin", "1");
      setAuthed(true);
      setMsg("");
      refresh();
    } else setMsg("Password errata");
  };

  const openLead = (lead: Lead) => {
    updateLead(lead.id, { read: true });
    setSelected({ ...lead, read: true });
    refresh();
  };

  const createDoc = async (type: "preventivo" | "fattura" = "preventivo") => {
    if (!selected) return;
    const items = quoteForm.lines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [label, amount] = l.split(";");
        return { label: (label || "Voce").trim(), amount: Number(amount) || 0 };
      });
    const amount = items.reduce((s, i) => s + i.amount, 0);
    const vatRate = Number(quoteForm.vatRate) || 10;
    const a = Math.round(amount * 0.3 * 100) / 100;
    const s = Math.round(amount * 0.4 * 100) / 100;
    const rest = Math.round((amount - a - s) * 100) / 100;
    const paymentSchedule = [
      { label: "Acconto alla firma del contratto", percent: 30, amount: a },
      {
        label: "SAL a completamento impianti e grezzo avanzato",
        percent: 40,
        amount: s,
      },
      {
        label: "Saldo a consegna lavori e collaudo finale",
        percent: 30,
        amount: rest,
      },
    ];
    const doc = addDoc({
      leadId: selected.id,
      type: type === "fattura" ? "fattura_elettronica" : type,
      title:
        type === "fattura"
          ? quoteForm.title.replace(/preventivo/i, "Fattura") || "Fattura lavori"
          : quoteForm.title,
      notes: quoteForm.notes,
      items: items.length ? items : [{ label: "Acconto lavori", amount: a || 8500 }],
      amount: amount || a || 8500,
      status: quoteForm.send ? "inviato" : "bozza",
      vatExcluded: true,
      vatRate,
      paymentSchedule,
    });
    if (quoteForm.send) {
      updateLead(selected.id, { status: "preventivo_inviato", read: true });
    }
    setMsg(
      quoteForm.send
        ? `${type === "fattura" ? "Fattura" : "Preventivo"} creato. Cliente: /area-cliente?code=${selected.accountCode}`
        : "Documento in bozza"
    );
    refresh();
    try {
      setPdfBusy(doc.id);
      await downloadDocumentPdf(doc, selected);
    } catch {
      setMsg((m) => m + " (PDF non generato)");
    } finally {
      setPdfBusy(null);
    }
  };

  const downloadDoc = async (d: Document) => {
    const lead = getLead(d.leadId) || selected;
    if (!lead) {
      setMsg("Lead non trovato");
      return;
    }
    try {
      setPdfBusy(d.id);
      await downloadDocumentPdf(d, lead);
    } catch {
      setMsg("Errore PDF");
    } finally {
      setPdfBusy(null);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-xl bg-white p-8 space-y-4">
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Admin</h1>
          <p className="text-sm text-warmgray-500">Password: admin2025</p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-lg border border-warmgray-200 px-4 py-3"
            placeholder="Password"
          />
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button type="submit" className="w-full rounded-lg bg-charcoal py-3 text-white font-semibold">
            Entra
          </button>
          <Link href="/" className="block text-center text-sm text-bronze">
            Torna al sito
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmgray-50 pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-charcoal">Dashboard</h1>
            <p className="text-sm text-warmgray-500">
              {unread > 0 ? `${unread} notifiche non lette` : "Nessuna nuova notifica"} · Ambiente DEMO fiscale
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setTab("leads");
                refresh();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "leads" ? "bg-charcoal text-white" : "bg-white border"
              }`}
            >
              Richieste ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("docs");
                refresh();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "docs" ? "bg-charcoal text-white" : "bg-white border"
              }`}
            >
              Documenti ({docs.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("fiscale");
                refresh();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "fiscale" ? "bg-charcoal text-white" : "bg-white border"
              }`}
            >
              Fiscale / SdI
            </button>
            <button type="button" onClick={refresh} className="rounded-lg border bg-white px-4 py-2 text-sm">
              Aggiorna
            </button>
            <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm">
              Sito
            </Link>
          </div>
        </div>

        {msg && (
          <p className="mb-4 rounded-lg bg-bronze/10 text-bronze text-sm px-4 py-2">{msg}</p>
        )}

        {tab === "fiscale" && <FiscalPanel onRefresh={refresh} />}

        {tab === "leads" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {leads.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openLead(l)}
                  className={`w-full text-left rounded-xl border bg-white p-4 ${
                    selected?.id === l.id ? "ring-2 ring-bronze" : ""
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-xs font-mono text-warmgray-400">{l.accountCode}</span>
                  </div>
                  <p className="text-sm text-warmgray-600 mt-1 line-clamp-2">{l.message}</p>
                </button>
              ))}
            </div>
            <div className="rounded-xl border bg-white p-5 sticky top-24 h-fit">
              {!selected ? (
                <p className="text-sm text-warmgray-500">Seleziona una richiesta</p>
              ) : (
                <>
                  <h2 className="font-serif text-xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-warmgray-600">
                    {selected.phone} · {selected.email}
                  </p>
                  <div className="mt-6 border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm">Crea documento</h3>
                    <input
                      value={quoteForm.title}
                      onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <textarea
                      value={quoteForm.lines}
                      onChange={(e) => setQuoteForm({ ...quoteForm, lines: e.target.value })}
                      rows={5}
                      className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                    />
                    <select
                      value={quoteForm.vatRate}
                      onChange={(e) => setQuoteForm({ ...quoteForm, vatRate: e.target.value })}
                      className="rounded-lg border px-2 py-1.5 text-sm"
                    >
                      <option value="10">IVA 10%</option>
                      <option value="22">IVA 22%</option>
                      <option value="4">IVA 4%</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={quoteForm.send}
                        onChange={(e) => setQuoteForm({ ...quoteForm, send: e.target.checked })}
                      />
                      Invia in area cliente
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => createDoc("preventivo")}
                        className="rounded-lg bg-bronze px-4 py-2 text-sm font-semibold text-white"
                      >
                        Preventivo PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => createDoc("fattura")}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      >
                        Fattura elettronica (PDF cortesia)
                      </button>
                      <Link
                        href={`/area-cliente?code=${selected.accountCode}`}
                        className="rounded-lg border px-4 py-2 text-sm"
                      >
                        Vedi come cliente
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "docs" && (
          <div className="rounded-xl border bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warmgray-50 text-left">
                <tr>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Titolo</th>
                  <th className="p-3">Importo</th>
                  <th className="p-3">Stato</th>
                  <th className="p-3">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{d.type}</td>
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">EUR {d.amount.toLocaleString("it-IT")}</td>
                    <td className="p-3">{d.status}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        disabled={pdfBusy === d.id}
                        onClick={() => downloadDoc(d)}
                        className="text-bronze font-semibold"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
