"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, FolderKanban, CheckSquare, FileText, ClipboardCheck,
  Shield, Package, Truck, Wallet, BadgeCheck, BarChart3, MessageSquare,
  Bell, LogOut, Receipt, Users, ArrowRight,
} from "lucide-react";
import {
  listLeads, listDocs, updateLead, unreadCount,
  type Lead, type Document,
} from "@/lib/client-db";
import FiscalPanel from "@/components/FiscalPanel";
import OpsModules from "@/components/admin/OpsModules";
import { subscribeOps, unreadNotifs, createSafety, createMaterial } from "@/lib/ops-store";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { company } from "@/data/company";
import { seedTasks, seedApprovals, seedSafety, seedMessages } from "@/data/admin-seed";
import {
  ADMIN_ROLES, ROLE_STORAGE_KEY, getRoleById,
  type AdminRole, type AdminNavId,
} from "@/data/admin-roles";

type NavId = AdminNavId;

const navMeta: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "progetti", label: "Progetti", icon: FolderKanban },
  { id: "richieste", label: "Richieste", icon: Users },
  { id: "task", label: "Task", icon: CheckSquare },
  { id: "documenti", label: "Documenti", icon: FileText },
  { id: "fiscale", label: "Fiscale / SdI", icon: Receipt },
  { id: "qualita", label: "Qualita", icon: ClipboardCheck },
  { id: "sicurezza", label: "Sicurezza", icon: Shield },
  { id: "magazzino", label: "Magazzino", icon: Package },
  { id: "attrezzature", label: "Attrezzature", icon: Truck },
  { id: "spese", label: "Spese", icon: Wallet },
  { id: "approvazioni", label: "Approvazioni", icon: BadgeCheck },
  { id: "report", label: "Report", icon: BarChart3 },
];

const modules = new Set([
  "progetti", "task", "qualita", "sicurezza", "magazzino",
  "attrezzature", "spese", "approvazioni", "report",
]);

export default function AdminApp() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [unread, setUnread] = useState(0);
  const [nav, setNav] = useState<NavId>("dashboard");
  const [opsUnread, setOpsUnread] = useState(0);

  const navMain = useMemo(
    () => (!role ? [] : navMeta.filter((n) => role.access.includes(n.id))),
    [role]
  );
  const can = useCallback((id: NavId) => !!role && role.access.includes(id), [role]);

  const refresh = useCallback(() => {
    setLeads(listLeads());
    setUnread(unreadCount());
    setDocs(listDocs());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = getRoleById(sessionStorage.getItem(ROLE_STORAGE_KEY));
    if (saved?.enabled) {
      setRole(saved);
      setNav("dashboard");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!role) return;
    refresh();
    const tick = () => setOpsUnread(unreadNotifs(role.id));
    tick();
    const t = setInterval(refresh, 3000);
    const unsub = subscribeOps(tick);
    return () => {
      clearInterval(t);
      unsub();
    };
  }, [role, refresh]);

  const enterAs = (r: AdminRole) => {
    if (!r.enabled) return;
    sessionStorage.setItem(ROLE_STORAGE_KEY, r.id);
    sessionStorage.setItem("pe-admin", "1");
    setRole(r);
    setNav("dashboard");
  };

  const logout = () => {
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    sessionStorage.removeItem("pe-admin");
    setRole(null);
  };

  const stats = useMemo(
    () => ({
      tasks: seedTasks.filter((t) => t.status !== "Completato").length,
      approvals: seedApprovals.filter((a) => a.status === "In attesa").length,
      issues: seedSafety.filter((s) => s.status !== "Chiuso").length,
    }),
    []
  );

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-500">
        Caricamento…
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">PE</div>
            <div>
              <p className="font-semibold text-lg text-slate-900">{company.name}</p>
              <p className="text-sm text-slate-500">Gestionale cantiere · accesso demo per ruolo</p>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Chi sei oggi?</h1>
          <p className="text-sm text-slate-500 mb-6">Nessuna password. Cambia ruolo in un click in call col cliente.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ADMIN_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={!r.enabled}
                onClick={() => enterAs(r)}
                className={`text-left rounded-2xl border bg-white p-5 shadow-sm transition ${
                  r.enabled ? "border-slate-200 hover:border-blue-400 hover:shadow-md" : "border-slate-100 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-xl ${r.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {r.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    <p className="text-sm text-blue-600 font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{r.blurb}</p>
                    {!r.enabled && <p className="mt-2 text-[11px] font-semibold text-slate-400 uppercase">Prossimamente</p>}
                  </div>
                  {r.enabled && <ArrowRight className="h-4 w-4 text-slate-300 mt-1" />}
                </div>
                {r.enabled && (
                  <span className="mt-4 inline-flex rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">
                    Entra come {r.title}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            <Link href="/" className="text-blue-600 hover:underline">Torna al sito</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex text-slate-800">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-100">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">PE</div>
          <div>
            <p className="font-semibold text-sm">{company.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Site Ops</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navMain.map((item) => {
            const Icon = item.icon;
            const active = nav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setNav(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3 space-y-1">
          <button type="button" className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <MessageSquare className="h-4 w-4" /> Messaggi
            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5">{opsUnread || seedMessages.length}</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" /> Notifiche
            <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5">{opsUnread || unread || 0}</span>
          </button>
          <div className="flex items-center gap-2 px-2 pt-3">
            <div className={`h-9 w-9 rounded-full ${role.color} text-white flex items-center justify-center text-xs font-bold`}>
              {role.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{role.name}</p>
              <p className="text-[11px] text-slate-400">{role.title}</p>
            </div>
            <button type="button" onClick={logout} className="p-1.5 text-slate-400 hover:text-slate-700">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-[#f4f6fb]/95 backdrop-blur border-b border-slate-200/80 px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">
              {nav === "dashboard"
                ? role.id === "direzione"
                  ? "Bentornato, Andrea"
                  : `Ciao, ${role.name.split(" ")[0]}`
                : navMeta.find((n) => n.id === nav)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              {nav === "dashboard" ? "Ecco cosa succede nei tuoi cantieri." : role.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={logout} className="rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
              Cambia ruolo
            </button>
            <Link href="/" className="rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">Sito</Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
            {navMain.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNav(item.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  nav === item.id ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {role.id === "capocantiere" && nav === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
              <button
                type="button"
                onClick={() => {
                  const t = window.prompt("Descrivi il problema di sicurezza");
                  if (!t) return;
                  createSafety({ title: t, site: "Residenza Navigli", severity: "Alta", createdBy: role.name });
                  setNav("sicurezza");
                }}
                className="rounded-2xl bg-rose-600 text-white px-4 py-5 text-base font-bold shadow-md active:scale-[0.98]"
              >
                Segnala problema
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = window.prompt("Materiale da richiedere");
                  if (!item) return;
                  const qty = window.prompt("Quantita", "10") || "1";
                  createMaterial({ item, qty, site: "Residenza Navigli", createdBy: role.name });
                  setNav("magazzino");
                }}
                className="rounded-2xl bg-violet-600 text-white px-4 py-5 text-base font-bold shadow-md active:scale-[0.98]"
              >
                Richiedi materiale
              </button>
            </div>
          )}

          {nav === "dashboard" && can("dashboard") && (
            <AdminDashboard
              firstName={role.name.split(" ")[0]}
              isDirezione={role.id === "direzione"}
              stats={stats}
              onNavigate={setNav}
            />
          )}

          {modules.has(nav) && can(nav) && <OpsModules section={nav as "progetti"} role={role} />}

          {nav === "richieste" && can("richieste") && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold mb-3">Richieste ({leads.length})</h2>
              <ul className="space-y-2">
                {leads.map((l) => (
                  <li key={l.id} className="rounded-xl border p-3">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{l.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nav === "documenti" && can("documenti") && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold mb-3">Documenti ({docs.length})</h2>
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id} className="flex justify-between border rounded-xl p-3 text-sm">
                    <span>{d.title}</span>
                    <span className="text-slate-500">EUR {d.amount.toLocaleString("it-IT")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nav === "fiscale" && can("fiscale") && <FiscalPanel onRefresh={refresh} />}
        </main>
      </div>
    </div>
  );
}
