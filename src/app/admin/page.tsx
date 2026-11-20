"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  ClipboardCheck,
  Shield,
  Package,
  Truck,
  Wallet,
  BadgeCheck,
  BarChart3,
  MessageSquare,
  Bell,
  Calendar,
  AlertTriangle,
  Activity,
  LogOut,
  Home,
  Receipt,
  Users,
} from "lucide-react";
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
import { company } from "@/data/company";

const PASSWORD = "admin2025";

type NavId =
  | "dashboard"
  | "progetti"
  | "richieste"
  | "documenti"
  | "fiscale"
  | "task"
  | "qualita"
  | "sicurezza"
  | "magazzino"
  | "attrezzature"
  | "spese"
  | "approvazioni"
  | "report";

const navMain: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "progetti", label: "Progetti", icon: FolderKanban },
  { id: "richieste", label: "Richieste", icon: Users },
  { id: "task", label: "Task", icon: CheckSquare },
  { id: "documenti", label: "Documenti", icon: FileText },
  { id: "fiscale", label: "Fiscale / SdI", icon: Receipt },
  { id: "qualita", label: "Qualità", icon: ClipboardCheck },
  { id: "sicurezza", label: "Sicurezza", icon: Shield },
  { id: "magazzino", label: "Magazzino", icon: Package },
  { id: "attrezzature", label: "Attrezzature", icon: Truck },
  { id: "spese", label: "Spese", icon: Wallet },
  { id: "approvazioni", label: "Approvazioni", icon: BadgeCheck },
  { id: "report", label: "Report", icon: BarChart3 },
];

const weekPulse = [
  { d: "Lun", v: 45 },
  { d: "Mar", v: 62 },
  { d: "Mer", v: 78 },
  { d: "Gio", v: 70 },
  { d: "Ven", v: 55 },
  { d: "Sab", v: 30 },
  { d: "Dom", v: 20 },
];

const deadlines = [
  { title: "Verbale ispezione fondazioni", cat: "Qualità", date: "20 mag 2026", pri: "High" as const },
  { title: "Approvazione disegni impianti", cat: "Approvazioni", date: "21 mag 2026", pri: "Medium" as const },
  { title: "Consegna cemento — 200 sacchi", cat: "Magazzino", date: "23 mag 2026", pri: "Low" as const },
  { title: "Prove di evacuazione cantiere", cat: "Sicurezza", date: "24 mag 2026", pri: "High" as const },
];

const activityFeed = [
  { t: 'Task "Getto solaio" completato', by: "Marco Rossi", ago: "1h fa", color: "bg-blue-500" },
  { t: "Magazzino: ferri Ø12 — 2,5 t", by: "S. Kumar", ago: "3h fa", color: "bg-emerald-500" },
  { t: "Richiesta approvazione tavola A-201", by: "Admin", ago: "5h fa", color: "bg-amber-500" },
  { t: "Controllo qualità piano 4", by: "CQ", ago: "1g fa", color: "bg-violet-500" },
  { t: "Segnalazione sicurezza: cavi aperti", by: "RSPP", ago: "1g fa", color: "bg-rose-500" },
];

function priClass(p: "High" | "Medium" | "Low") {
  if (p === "High") return "bg-rose-100 text-rose-700";
  if (p === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function ModulePlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{body}</p>
      <p className="mt-4 inline-block rounded-full bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1">
        Modulo DEMO — dati illustrativi
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [nav, setNav] = useState<NavId>("dashboard");
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    title: "Preventivo ristrutturazione",
    notes: "Validita 30 giorni. Importi IVA esclusa.",
    lines:
      "Demolizioni selettive e smaltimento;3200\nImpianto idraulico completo;4800\nImpianto elettrico a norma CEI;3600\nPosa rivestimenti e pavimenti;7200\nSanitari e rubinetteria;5200\nManodopera e direzione lavori;2000",
    vatRate: "10",
    send: true,
  });

  const refresh = useCallback(() => {
    const l = listLeads();
    setLeads(l);
    setUnread(unreadCount());
    setDocs(listDocs());
    if (selected) setSelected(l.find((x) => x.id === selected.id) || null);
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
    const t = setInterval(refresh, 3000);
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

  const logout = () => {
    sessionStorage.removeItem("pe-admin");
    setAuthed(false);
  };

  const openLead = (lead: Lead) => {
    updateLead(lead.id, { read: true });
    setSelected({ ...lead, read: true });
    setNav("richieste");
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
      { label: "Acconto alla firma", percent: 30, amount: a },
      { label: "SAL impianti/grezzo", percent: 40, amount: s },
      { label: "Saldo collaudo", percent: 30, amount: rest },
    ];
    const doc = addDoc({
      leadId: selected.id,
      type: type === "fattura" ? "fattura_elettronica" : type,
      title:
        type === "fattura"
          ? quoteForm.title.replace(/preventivo/i, "Fattura") || "Fattura"
          : quoteForm.title,
      notes: quoteForm.notes,
      items: items.length ? items : [{ label: "Acconto", amount: a || 8500 }],
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
      `${type === "fattura" ? "Fattura" : "Preventivo"} creato · /area-cliente?code=${selected.accountCode}`
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
    if (!lead) return;
    try {
      setPdfBusy(d.id);
      await downloadDocumentPdf(d, lead);
    } finally {
      setPdfBusy(null);
    }
  };

  const stats = useMemo(() => {
    const pending = docs.filter((d) => d.status === "inviato").length;
    return {
      tasksToday: 18,
      pendingApprovals: pending + 12,
      activity: 32,
      issues: 7,
      docs: docs.length,
      leads: leads.length,
    };
  }, [docs, leads]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg space-y-4 border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">PE</div>
            <div>
              <p className="font-semibold text-slate-900">{company.name}</p>
              <p className="text-xs text-slate-500">Gestionale cantiere</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Password: admin2025</p>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Password" />
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold text-sm">Accedi</button>
          <Link href="/" className="block text-center text-sm text-blue-600">Torna al sito</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex text-slate-800">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-100">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">PE</div>
          <div>
            <p className="font-semibold text-sm leading-tight">{company.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Site Ops</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navMain.map((item) => {
            const Icon = item.icon;
            const active = nav === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setNav(item.id)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3 space-y-1">
          <button type="button" className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <MessageSquare className="h-4 w-4" /> Messaggi
            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5">3</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" /> Notifiche
            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5">{unread || 7}</span>
          </button>
          <div className="flex items-center gap-2 px-2 pt-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">AM</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">Admin PE</p>
              <p className="text-[11px] text-slate-400">Project Manager</p>
            </div>
            <button type="button" onClick={logout} className="p-1.5 text-slate-400 hover:text-slate-700"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-[#f4f6fb]/95 backdrop-blur border-b border-slate-200/80 px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">{nav === "dashboard" ? "Bentornato, Admin" : navMain.find((n) => n.id === nav)?.label}</h1>
            <p className="text-xs text-slate-500">Ecco cosa succede sui tuoi cantieri · ambiente DEMO</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Home className="h-4 w-4 text-slate-400" /> Residenza Navigli · PRJ-1001
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" /> Questa settimana
            </div>
            <Link href="/" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Sito</Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {msg && <p className="rounded-xl bg-blue-50 text-blue-800 text-sm px-4 py-2 border border-blue-100">{msg}</p>}

          <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
            {navMain.slice(0, 8).map((item) => (
              <button key={item.id} type="button" onClick={() => setNav(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${nav === item.id ? "bg-blue-600 text-white" : "bg-white border text-slate-600"}`}>{item.label}</button>
            ))}
          </div>

          {nav === "dashboard" && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Task di oggi", value: stats.tasksToday, sub: "24% dei task settimanali", icon: CheckSquare, bar: "bg-blue-500" },
                  { label: "Approvazioni in attesa", value: stats.pendingApprovals, sub: "Richiede la tua azione", icon: FileText, bar: "bg-amber-500" },
                  { label: "Attività recenti", value: stats.activity, sub: "Aggiornamenti questa settimana", icon: Activity, bar: "bg-emerald-500" },
                  { label: "Problemi aperti", value: stats.issues, sub: "Da attenzionare", icon: AlertTriangle, bar: "bg-rose-500" },
                ].map((k) => (
                  <div key={k.label} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500">{k.label}</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{k.value}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{k.sub}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center"><k.icon className="h-5 w-5 text-slate-500" /></div>
                    </div>
                    <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full w-2/3 ${k.bar}`} /></div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-sm">Pulse progetti</h2>
                    <span className="text-xs text-slate-400">Questa settimana</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {weekPulse.map((b) => (
                      <div key={b.d} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md bg-blue-500/90" style={{ height: `${b.v}%` }} />
                        <span className="text-[10px] text-slate-400">{b.d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-semibold text-sm mb-4">Azioni rapide</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Crea task", icon: CheckSquare, c: "text-blue-600 bg-blue-50", go: "task" as NavId },
                      { label: "Registra spesa", icon: Wallet, c: "text-emerald-600 bg-emerald-50", go: "spese" as NavId },
                      { label: "Magazzino", icon: Package, c: "text-violet-600 bg-violet-50", go: "magazzino" as NavId },
                      { label: "Attrezzature", icon: Truck, c: "text-amber-600 bg-amber-50", go: "attrezzature" as NavId },
                      { label: "Approvazioni", icon: BadgeCheck, c: "text-sky-600 bg-sky-50", go: "approvazioni" as NavId },
                      { label: "Sicurezza", icon: Shield, c: "text-rose-600 bg-rose-50", go: "sicurezza" as NavId },
                    ].map((a) => (
                      <button key={a.label} type="button" onClick={() => setNav(a.go)} className="rounded-xl border border-slate-100 p-3 text-center hover:border-slate-300 transition">
                        <div className={`mx-auto h-9 w-9 rounded-lg flex items-center justify-center ${a.c}`}><a.icon className="h-4 w-4" /></div>
                        <p className="mt-2 text-[11px] font-medium text-slate-700 leading-tight">{a.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm">Avanzamento progetto</h2>
                    <span className="text-xs text-slate-400">Overall</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-slate-100 h-28 mb-3 flex items-center justify-center text-slate-400 text-xs">Residenza Navigli · Milano</div>
                  <p className="font-semibold">Residenza Navigli</p>
                  <p className="text-xs text-slate-500">PRJ-1001 · Residenziale</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1"><span>Progresso complessivo</span><span className="font-bold text-blue-600">62%</span></div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-[62%] bg-blue-500 rounded-full" /></div>
                    <p className="mt-2 text-[11px] text-emerald-600 font-medium">In anticipo di 5 giorni</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-emerald-50 p-2"><p className="text-sm font-bold text-emerald-700">62%</p><p className="text-[10px] text-emerald-600">Completato</p></div>
                    <div className="rounded-lg bg-sky-50 p-2"><p className="text-sm font-bold text-sky-700">28%</p><p className="text-[10px] text-sky-600">In corso</p></div>
                    <div className="rounded-lg bg-rose-50 p-2"><p className="text-sm font-bold text-rose-700">10%</p><p className="text-[10px] text-rose-600">In ritardo</p></div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm">Scadenze imminenti</h2>
                    <span className="text-xs text-blue-600 font-medium">Vedi tutte</span>
                  </div>
                  <ul className="space-y-2">
                    {deadlines.map((d) => (
                      <li key={d.title} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{d.title}</p>
                          <p className="text-[11px] text-slate-400">{d.cat} · {d.date}</p>
                        </div>
                        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${priClass(d.pri)}`}>{d.pri}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm">Attività recente</h2>
                    <span className="text-xs text-blue-600 font-medium">Vedi tutte</span>
                  </div>
                  <ul className="space-y-3">
                    {activityFeed.map((a) => (
                      <li key={a.t} className="flex gap-3">
                        <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${a.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{a.t}</p>
                          <p className="text-[11px] text-slate-400">{a.by} · {a.ago}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <button type="button" onClick={() => setNav("richieste")} className="rounded-xl border border-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-50">Richieste ({stats.leads})</button>
                    <button type="button" onClick={() => setNav("documenti")} className="rounded-xl border border-slate-200 py-2 font-semibold text-slate-700 hover:bg-slate-50">Documenti ({stats.docs})</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {nav === "richieste" && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                {leads.map((l) => (
                  <button key={l.id} type="button" onClick={() => openLead(l)} className={`w-full text-left rounded-2xl border bg-white p-4 shadow-sm ${selected?.id === l.id ? "ring-2 ring-blue-500" : "border-slate-200"}`}>
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{l.name}</span>
                      <span className="text-xs font-mono text-slate-400">{l.accountCode}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{l.message}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                {!selected ? (
                  <p className="text-sm text-slate-500">Seleziona una richiesta</p>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    <p className="text-sm text-slate-500">{selected.phone} · {selected.email}</p>
                    <div className="mt-4 space-y-2">
                      <input value={quoteForm.title} onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                      <textarea value={quoteForm.lines} onChange={(e) => setQuoteForm({ ...quoteForm, lines: e.target.value })} rows={5} className="w-full rounded-xl border px-3 py-2 text-sm font-mono" />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => createDoc("preventivo")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Preventivo PDF</button>
                        <button type="button" onClick={() => createDoc("fattura")} className="rounded-xl border px-4 py-2 text-sm font-semibold">Fattura elettronica</button>
                        <Link href={`/area-cliente?code=${selected.accountCode}`} className="rounded-xl border px-4 py-2 text-sm">Area cliente</Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {nav === "documenti" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left"><tr><th className="p-3">Tipo</th><th className="p-3">Titolo</th><th className="p-3">Importo</th><th className="p-3">Stato</th><th className="p-3">Azioni</th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="p-3">{d.type}</td>
                      <td className="p-3">{d.title}</td>
                      <td className="p-3">EUR {d.amount.toLocaleString("it-IT")}</td>
                      <td className="p-3">{d.status}</td>
                      <td className="p-3"><button type="button" disabled={pdfBusy === d.id} onClick={() => downloadDoc(d)} className="text-blue-600 font-semibold">PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nav === "fiscale" && <FiscalPanel onRefresh={refresh} />}

          {nav === "progetti" && <ModulePlaceholder title="Progetti cantiere" body="Elenco cantieri, avanzamento SAL, foto e documentazione di cantiere." />}
          {nav === "task" && <ModulePlaceholder title="Task operativi" body="Assegna e traccia attività di cantiere. DEMO: struttura UI pronta." />}
          {nav === "qualita" && <ModulePlaceholder title="Controlli qualità" body="Checklist ispezioni, non conformità e verbali di collaudo." />}
          {nav === "sicurezza" && <ModulePlaceholder title="Sicurezza cantiere" body="Segnalazioni, DPI, formazione e osservazioni HSE." />}
          {nav === "magazzino" && <ModulePlaceholder title="Magazzino materiali" body="Giacenze, consegne in cantiere e prelievi." />}
          {nav === "attrezzature" && <ModulePlaceholder title="Attrezzature" body="Registro mezzi e attrezzature di cantiere." />}
          {nav === "spese" && <ModulePlaceholder title="Spese di progetto" body="Registrazione costi e confronto con budget." />}
          {nav === "approvazioni" && <ModulePlaceholder title="Approvazioni" body="Workflow disegni, varianti e SAL da firmare." />}
          {nav === "report" && <ModulePlaceholder title="Report" body="Report settimanali avanzamento, costi e sicurezza." />}
        </main>
      </div>
    </div>
  );
}
