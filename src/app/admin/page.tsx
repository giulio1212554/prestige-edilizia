"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  accountCode: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  read: boolean;
  details?: {
    city?: string;
    workType?: string;
    sqm?: string;
    budget?: string;
    deadline?: string;
    urgent?: boolean;
  };
};

type Doc = {
  id: string;
  leadId: string;
  type: string;
  title: string;
  amount: number;
  status: string;
  items: { label: string; amount: number }[];
};

const PASSWORD = "admin2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
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

  const headers = () => ({
    Authorization: `Bearer ${PASSWORD}`,
    "Content-Type": "application/json",
  });

  const refresh = useCallback(async () => {
    const [lr, dr] = await Promise.all([
      fetch("/api/leads", { headers: headers() }),
      fetch("/api/docs", { headers: headers() }),
    ]);
    if (!lr.ok) {
      setAuthed(false);
      return;
    }
    const ld = await lr.json();
    const dd = await dr.json();
    setLeads(ld.leads || []);
    setUnread(ld.unread || 0);
    setDocs(dd.docs || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("pe-admin") === "1") {
      refresh();
    }
  }, [refresh]);

  const login = (e: FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem("pe-admin", "1");
      refresh();
    } else setMsg("Password errata");
  };

  const markRead = async (lead: Lead) => {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ read: true }),
    });
    setSelected(lead);
    refresh();
  };

  const createDoc = async () => {
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
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        leadId: selected.id,
        type: "preventivo",
        title: quoteForm.title,
        notes: quoteForm.notes,
        items,
        amount,
        send: quoteForm.send,
      }),
    });
    if (res.ok) {
      setMsg("Preventivo creato" + (quoteForm.send ? " e inviato al cliente" : ""));
      refresh();
    } else setMsg("Errore creazione");
  };

  const createInvoice = async (leadId: string) => {
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        leadId,
        type: "fattura",
        title: "Fattura acconto lavori",
        notes: "Fattura dimostrativa — firma digitale online.",
        items: [{ label: "Acconto 30% lavori", amount: 8500 }],
        amount: 8500,
        send: true,
      }),
    });
    if (res.ok) {
      setMsg("Fattura inviata");
      refresh();
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
              {unread > 0 ? `${unread} notifiche non lette` : "Nessuna nuova notifica"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("leads")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "leads" ? "bg-charcoal text-white" : "bg-white border"
              }`}
            >
              Richieste ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("docs")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === "docs" ? "bg-charcoal text-white" : "bg-white border"
              }`}
            >
              Documenti ({docs.length})
            </button>
            <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm">
              Sito
            </Link>
          </div>
        </div>

        {msg && (
          <p className="mb-4 rounded-lg bg-bronze/10 text-bronze text-sm px-4 py-2">{msg}</p>
        )}

        {tab === "leads" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {leads.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => markRead(l)}
                  className={`w-full text-left rounded-xl border bg-white p-4 transition hover:border-bronze ${
                    !l.read ? "border-bronze/40 shadow-sm" : "border-warmgray-200"
                  } ${selected?.id === l.id ? "ring-2 ring-bronze" : ""}`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-charcoal">{l.name}</span>
                    <span className="text-xs font-mono text-warmgray-400">{l.accountCode}</span>
                  </div>
                  <p className="text-sm text-warmgray-600 mt-1 line-clamp-2">{l.message}</p>
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
                  <h2 className="font-serif text-xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-warmgray-600">
                    {selected.phone} · {selected.email}
                  </p>
                  <p className="mt-1 text-xs font-mono text-bronze">{selected.accountCode}</p>
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
                      onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Titolo"
                    />
                    <textarea
                      value={quoteForm.lines}
                      onChange={(e) => setQuoteForm({ ...quoteForm, lines: e.target.value })}
                      rows={5}
                      className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                      placeholder="Voce;importo (una per riga)"
                    />
                    <textarea
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={quoteForm.send}
                        onChange={(e) => setQuoteForm({ ...quoteForm, send: e.target.checked })}
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
                        onClick={() => createInvoice(selected.id)}
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
          <div className="rounded-xl border bg-white overflow-hidden">
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
