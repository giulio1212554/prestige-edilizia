"use client";

import {
  CheckSquare,
  FileText,
  Activity,
  AlertTriangle,
  ClipboardList,
  Wallet,
  Package,
  Truck,
  BadgeCheck,
  Shield,
  Calendar,
} from "lucide-react";
import { seedTasks } from "@/data/admin-seed";
import type { AdminNavId } from "@/data/admin-roles";

type Props = {
  firstName: string;
  isDirezione: boolean;
  stats: { tasks: number; approvals: number; issues: number };
  onNavigate: (id: AdminNavId) => void;
};

const weekPulse = [
  { d: "Lun", v: 45 },
  { d: "Mar", v: 62 },
  { d: "Mer", v: 78 },
  { d: "Gio", v: 70 },
  { d: "Ven", v: 55 },
  { d: "Sab", v: 30 },
  { d: "Dom", v: 20 },
];

const quickActions: {
  id: AdminNavId;
  label: string;
  sub: string;
  icon: typeof CheckSquare;
  color: string;
}[] = [
  { id: "task", label: "Crea task", sub: "Assegna e traccia", icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
  { id: "spese", label: "Registra spesa", sub: "Costo di cantiere", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
  { id: "magazzino", label: "Magazzino", sub: "Aggiungi materiali", icon: Package, color: "text-violet-600 bg-violet-50" },
  { id: "attrezzature", label: "Attrezzature", sub: "Registra mezzi", icon: Truck, color: "text-amber-600 bg-amber-50" },
  { id: "approvazioni", label: "Approvazioni", sub: "Revisiona richieste", icon: BadgeCheck, color: "text-sky-600 bg-sky-50" },
  { id: "sicurezza", label: "Sicurezza", sub: "Segnalazione HSE", icon: Shield, color: "text-rose-600 bg-rose-50" },
];

const activity = [
  { text: 'Task "Getto pilastri" completato', by: "Luca Ferrari", time: "1h fa", color: "bg-blue-500" },
  { text: "Magazzino: ferro B450C +1,2 t", by: "Sara Verdi", time: "3h fa", color: "bg-emerald-500" },
  { text: "Approvazione richiesta su SAL-03", by: "Elena Rossi", time: "5h fa", color: "bg-amber-500" },
  { text: "Controllo qualita solaio piano 2", by: "Marco Bianchi", time: "1g fa", color: "bg-violet-500" },
  { text: "Osservazione sicurezza: cavo a terra", by: "Luca Ferrari", time: "1g fa", color: "bg-rose-500" },
];

export default function AdminDashboard({ firstName, isDirezione, stats, onNavigate }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Task in scadenza", value: stats.tasks, sub: "24% dei task settimanali", icon: CheckSquare, bar: "bg-blue-500", iconBg: "bg-blue-50 text-blue-600" },
          { label: "Approvazioni", value: stats.approvals, sub: "Richiedono azione", icon: FileText, bar: "bg-amber-500", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Attivita recenti", value: 32, sub: "Aggiornamenti questa settimana", icon: Activity, bar: "bg-emerald-500", iconBg: "bg-emerald-50 text-emerald-600" },
          { label: "Problemi aperti", value: stats.issues, sub: "Da attenzionare", icon: AlertTriangle, bar: "bg-rose-500", iconBg: "bg-rose-50 text-rose-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-500">{k.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{k.value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{k.sub}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${k.iconBg}`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full w-2/3 rounded-full ${k.bar}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-slate-900">Pulse progetti settimanale</h2>
            <span className="text-[11px] text-slate-400 border rounded-lg px-2 py-0.5">Questa settimana</span>
          </div>
          <div className="flex items-end gap-2 h-44">
            {weekPulse.map((b) => (
              <div key={b.d} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500">{b.v}%</span>
                <div className="w-full rounded-t-md bg-blue-500" style={{ height: `${b.v}%` }} />
                <span className="text-[10px] text-slate-400">{b.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-4">Azioni rapide</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id + a.label}
                  type="button"
                  onClick={() => onNavigate(a.id)}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-left hover:border-slate-300 hover:bg-white transition"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2 ${a.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{a.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-slate-900">Avanzamento progetto</h2>
            <span className="text-[11px] text-slate-400 border rounded-lg px-2 py-0.5">Overall</span>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-100 h-28 mb-3 flex items-center justify-center text-slate-400 text-xs">
            Residenza Navigli · cantiere
          </div>
          <p className="font-semibold text-sm">Residenza Navigli</p>
          <p className="text-[11px] text-slate-500">PRJ-1001 · Residenziale · Milano</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Progresso complessivo</span>
              <span className="font-bold text-blue-600">62%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[62%] bg-blue-500 rounded-full" />
            </div>
            <p className="mt-2 text-[11px] text-emerald-600 font-medium">In anticipo di 5 giorni</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 p-2">
              <p className="text-sm font-bold text-emerald-700">62%</p>
              <p className="text-[10px] text-emerald-600">Completato</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-2">
              <p className="text-sm font-bold text-sky-700">28%</p>
              <p className="text-[10px] text-sky-600">In corso</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-2">
              <p className="text-sm font-bold text-rose-700">10%</p>
              <p className="text-[10px] text-rose-600">In ritardo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-slate-900">Scadenze imminenti</h2>
            <button type="button" onClick={() => onNavigate("task")} className="text-[11px] text-blue-600 font-medium">
              Vedi tutte
            </button>
          </div>
          <ul className="space-y-2">
            {seedTasks.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-slate-800">{d.title}</p>
                  <p className="text-[11px] text-slate-400">{d.project} · {d.due}</p>
                </div>
                <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">{d.pri}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-slate-900">Attivita recenti</h2>
            <span className="text-[11px] text-blue-600 font-medium">Vedi tutte</span>
          </div>
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={a.text} className="flex gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${a.color}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{a.text}</p>
                  <p className="text-[11px] text-slate-400">{a.by} · {a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isDirezione && (
        <p className="text-[11px] text-slate-400 text-center">
          Vista Direzione · {firstName} · accesso completo a tutti i moduli
        </p>
      )}
    </div>
  );
}
