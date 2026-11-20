"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  listLeads,
  listDocs,
  updateLead,
  addDoc,
  unreadCount,
  type Lead,
  type Document,
} from "@/lib/client-db";

const PASSWORD = "admin2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [tab, setTab] = useState<"leads" | "docs">("leads");
  const [quoteForm, setQuoteForm] = useState({
    title: "Preventivo lavori",
    notes: "Validità 30 giorni. IVA esclusa.",
    lines: "Demolizioni;3000\nImpianti;8000\nFiniture;15000\nManodopera;5000",
    send: true,
  });
  const [msg, setMsg] = useState("");

  const refresh = useCallback(() => {
    const l = listLeads();
    setLeads(l);
    setUnread(unreadCount());
    setDocs(listDocs());
    if (selected) {
      const fresh = l.find((x) => x.id === selected.id) || null;
      setSelected(fresh);
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
    const t = setInterval(refresh, 2000);
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

  const createDoc = () => {
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
    addDoc({
      leadId: selected.id,
      type: "preventivo",
      title: quoteForm.title,
      notes: quoteForm.notes,
      items,
      amount,
      status: quoteForm.send ? "inviato" : "bozza",
    });
    if (quoteForm.send) {
      updateLead(selected.id, { status: "preventivo_inviato", read: true });
    }
    setMsg(
      quoteForm.send
        ? `Preventivo inviato. Cliente: /area-cliente?code=${selected.accountCode}`
        : "Preventivo salvato in bozza"
    );
    refresh();
  };

  const createInvoice = () => {
    if (!selected) return;
    addDoc({
      leadId: selected.id,
      type: "fattura",
      title: "Fattura acconto lavori",
      notes: "Fattura dimostrativa — firma digitale online.",
      items: [{ label: "Acconto 30% lavori", amount: 8500 }],
      amount: 8500,
      status: "inviato",
    });
    setMsg("Fattura inviata in area cliente");
    refresh();
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-xl bg-white p-8 space-y-4"
        >
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
          <button
            type="submit"
            className="w-full rounded-lg bg-charcoal py-3 text-white font-semibold"
          >
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
            <h1 className="font-serif text-3xl font-semibold text-charcoal">
              Dashboard
            </h1>
            <p className="text-sm text-warmgray-500">
              {unread > 0
                ? `${unread} notifiche non lette`
                : "Nessuna nuova notifica"}{" "}
              · dati salvati sul browser (demo)
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
              onClick={refresh}
              className="rounded-lg border bg-white px-4 py-2 text-sm"
            >
              Aggiorna
            </button>
            <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm">
              Sito
            </Link>
          </div>
        </div>

        {msg && (
          <p className="mb-4 rounded-lg bg-bronze/10 text-bronze text-sm px-4 py-2">
            {msg}
          </p>
        )}

        {tab === "leads" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {leads.length === 0 && (
                <p className="text-sm text-warmgray-500 p-4 border border-dashed rounded-xl">
                  Nessuna richiesta. Invia un preventivo dal form in homepage.
                </p>
              )}
              {leads.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openLead(l)}
                  className={`w-full text-left rounded-xl border bg-white p-4 transition hover:border-bronze ${
                    !l.read ? "border-bronze/40 shadow-sm" : "border-warmgray-200"
                  } ${selected?.id === l.id ? "ring-2 ring-bronze" : ""}`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-charcoal">{l.name}</span>
                    <span className="text-xs font-mono text-warmgray-400">
                      {l.accountCode}
                    </span>
                  </div>
                  <p className="text-sm text-warmgray-600 mt-1 line-clamp-2">
                    {l.message}
                  </p>
                  <p className="text-xs text-warmgray-400 mt-2">
                    {l.status} · {new Date(l.createdAt).toLocaleString("it-IT")}
                    {l.details?.urgent ? " · URGENTE" : ""}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-warmgray-200 bg-white p-5 sticky top-24 h-fit">
              {!selected ? (
                <p className="text-sm text-warmgray-500">Seleziona una richiesta</p>
              ) : (
                <>
                  <h2 className="font-serif text-xl font-semibold">
                    {selected.name}
                  </h2>
                  <p className="text-sm text-warmgray-600">
                    {selected.phone} · {selected.email}
                  </p>
                  <p className="mt-1 text-xs font-mono text-bronze">
                    {selected.accountCode}
                  </p>
                  {selected.details && (
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selected.details).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-xs text-warmgray-400">{k}</dt>
                          <dd className="font-medium">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-4 text-sm text-warmgray-700">{selected.message}</p>

                  <div className="mt-6 border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm">Crea preventivo</h3>
                    <input
                      value={quoteForm.title}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, title: e.target.value })
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Titolo"
                    />
                    <textarea
                      value={quoteForm.lines}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, lines: e.target.value })
                      }
                      rows={5}
                      className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                      placeholder="Voce;importo (una per riga)"
                    />
                    <textarea
                      value={quoteForm.notes}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={quoteForm.send}
                        onChange={(e) =>
                          setQuoteForm({ ...quoteForm, send: e.target.checked })
                        }
                      />
                      Invia subito in area cliente
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={createDoc}
                        className="rounded-lg bg-bronze px-4 py-2 text-sm font-semibold text-white"
                      >
                        Genera preventivo
                      </button>
                      <button
                        type="button"
                        onClick={createInvoice}
                        className="rounded-lg border border-charcoal px-4 py-2 text-sm font-semibold"
                      >
                        Invia fattura demo
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
                  <th className="p-3">Lead</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{d.type}</td>
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">€ {d.amount.toLocaleString("it-IT")}</td>
                    <td className="p-3">{d.status}</td>
                    <td className="p-3 font-mono text-xs">{d.leadId}</td>
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
