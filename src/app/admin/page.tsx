"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Bell,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";

type LeadStatus = "nuova" | "in_lavorazione" | "chiusa";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "sopralluogo" | "preventivo" | "altro";
  status: LeadStatus;
  createdAt: string;
  read: boolean;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  nuova: "Nuova",
  in_lavorazione: "In lavorazione",
  chiusa: "Chiusa",
};

const TYPE_LABEL = {
  sopralluogo: "Sopralluogo",
  preventivo: "Preventivo",
  altro: "Altro",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

  const fetchLeads = useCallback(async (auth: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${auth}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        setToken(null);
        setError("Sessione scaduta. Accedi di nuovo.");
        return;
      }
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setLeads(data.leads || []);
      setUnread(data.unread || 0);
    } catch {
      setError("Impossibile caricare le richieste.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchLeads(token);
    const t = setInterval(() => fetchLeads(token), 20000);
    return () => clearInterval(t);
  }, [token, fetchLeads]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        setError("Password non corretta");
        return;
      }
      sessionStorage.setItem("admin_token", password);
      setToken(password);
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setLeads([]);
    setSelected(null);
  };

  const patchLead = async (
    id: string,
    patch: { status?: LeadStatus; read?: boolean }
  ) => {
    if (!token) return;
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const data = await res.json();
    setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
    if (selected?.id === id) setSelected(data.lead);
    if (patch.read === true) setUnread((u) => Math.max(0, u - 1));
  };

  const openLead = (lead: Lead) => {
    setSelected(lead);
    if (!lead.read) patchLead(lead.id, { read: true });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!token) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-sm bg-white p-8 shadow-xl space-y-5"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-bronze font-medium">
              Area riservata
            </p>
            <h1 className="font-serif text-2xl text-charcoal font-semibold mt-1">
              Admin Prestige
            </h1>
            <p className="text-sm text-warmgray-500 mt-1">
              Accedi per gestire richieste e notifiche.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-warmgray-200 px-4 py-3 focus:border-bronze focus:outline-none"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-sm bg-bronze py-3 text-sm font-semibold text-white hover:bg-bronze-600 disabled:opacity-60"
          >
            {loading ? "Accesso..." : "Accedi"}
          </button>
          <p className="text-xs text-warmgray-400 text-center">
            Password demo: <code className="text-charcoal">admin2025</code>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      <header className="sticky top-0 z-20 border-b border-warmgray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-semibold text-charcoal">
              Dashboard richieste
            </h1>
            {unread > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bronze/10 px-2.5 py-1 text-xs font-semibold text-bronze">
                <Bell className="h-3.5 w-3.5" />
                {unread} nuov{unread === 1 ? "a" : "e"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => token && fetchLeads(token)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-warmgray-200 px-3 py-2 text-sm text-charcoal hover:bg-warmgray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Aggiorna
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-warmgray-600 hover:text-charcoal"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-sm text-warmgray-500 mb-2">
            <Inbox className="h-4 w-4" />
            {leads.length} richiest{leads.length === 1 ? "a" : "e"}
          </div>
          {leads.length === 0 && !loading && (
            <p className="text-sm text-warmgray-500 py-8 text-center">
              Nessuna richiesta al momento.
            </p>
          )}
          {leads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => openLead(lead)}
              className={`w-full text-left rounded-sm border p-4 transition ${
                selected?.id === lead.id
                  ? "border-bronze bg-bronze/5"
                  : "border-warmgray-100 bg-white hover:border-warmgray-200"
              } ${!lead.read ? "ring-1 ring-bronze/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-charcoal truncate">
                    {!lead.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-bronze mr-2 align-middle" />
                    )}
                    {lead.name}
                  </p>
                  <p className="text-xs text-warmgray-500 mt-0.5">
                    {TYPE_LABEL[lead.type]} · {formatDate(lead.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${
                    lead.status === "nuova"
                      ? "bg-bronze/15 text-bronze"
                      : lead.status === "in_lavorazione"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-warmgray-100 text-warmgray-600"
                  }`}
                >
                  {STATUS_LABEL[lead.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-warmgray-600 line-clamp-2">
                {lead.message}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-sm border border-warmgray-100 bg-white p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-warmgray-100 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-bronze font-medium">
                    {TYPE_LABEL[selected.type]}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-charcoal mt-1">
                    {selected.name}
                  </h2>
                  <p className="text-sm text-warmgray-500 mt-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    patchLead(selected.id, {
                      status: e.target.value as LeadStatus,
                    })
                  }
                  className="rounded-sm border border-warmgray-200 px-3 py-2 text-sm focus:border-bronze focus:outline-none"
                >
                  <option value="nuova">Nuova</option>
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="chiusa">Chiusa</option>
                </select>
              </div>

              <div className="mt-6 space-y-4">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-3 text-charcoal hover:text-bronze"
                >
                  <Mail className="h-4 w-4 text-warmgray-400" />
                  {selected.email}
                </a>
                <a
                  href={`tel:${selected.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-charcoal hover:text-bronze"
                >
                  <Phone className="h-4 w-4 text-warmgray-400" />
                  {selected.phone}
                </a>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-warmgray-400 font-medium mb-2">
                  Messaggio
                </p>
                <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${selected.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Buongiorno ${selected.name}, la contatto da Prestige Edilizia in merito alla sua richiesta.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-bronze px-4 py-2.5 text-sm font-semibold text-white hover:bg-bronze-600"
                >
                  Rispondi su WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => patchLead(selected.id, { status: "chiusa" })}
                  className="inline-flex items-center gap-2 rounded-sm border border-warmgray-200 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-warmgray-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Segna come chiusa
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-warmgray-200 bg-white/50 p-12 text-center text-warmgray-500">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Seleziona una richiesta per vedere i dettagli</p>
              <p className="text-sm mt-1">
                Le nuove richieste dal sito appaiono qui in automatico
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
