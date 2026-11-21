"use client";

import { useEffect, useState } from "react";
import {
  getOps,
  subscribeOps,
  createTask,
  completeTask,
  createSafety,
  createMaterial,
  createExpense,
  decideApproval,
  type OpsState,
} from "@/lib/ops-store";
import type { AdminRole } from "@/data/admin-roles";

type Section =
  | "progetti"
  | "task"
  | "qualita"
  | "sicurezza"
  | "magazzino"
  | "attrezzature"
  | "spese"
  | "approvazioni"
  | "report";

export default function OpsModules({ section, role }: { section: Section; role: AdminRole }) {
  const [ops, setOps] = useState<OpsState | null>(null);
  const [title, setTitle] = useState("");
  const [extra, setExtra] = useState("");
  const [amount, setAmount] = useState("1200");

  useEffect(() => {
    setOps(getOps());
    return subscribeOps(() => setOps(getOps()));
  }, []);

  if (!ops) return <p className="text-sm text-slate-500">Caricamento…</p>;

  const isPM = role.id === "project_manager" || role.id === "direzione";
  const isCapo = role.id === "capocantiere";
  const isAdmin = role.id === "amministrazione" || role.id === "direzione";
  const isDir = role.id === "direzione" || role.id === "project_manager";

  if (section === "task") {
    const mine = isCapo ? ops.tasks.filter((t) => t.assigneeRole === "capocantiere") : ops.tasks;
    return (
      <div className="space-y-4">
        {isPM && (
          <form
            className="rounded-2xl border bg-white p-4 shadow-sm space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              createTask({
                title: title.trim(),
                project: "Residenza Navigli",
                assignee: "Luca Ferrari",
                assigneeRole: "capocantiere",
                pri: "Media",
                due: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
                createdBy: role.name,
              });
              setTitle("");
            }}
          >
            <p className="text-sm font-semibold">Assegna task al Capocantiere</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Montaggio impalcature lato nord" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Crea e assegna</button>
          </form>
        )}
        <div className="rounded-2xl border bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="p-3">Task</th><th className="p-3">Assegnato</th><th className="p-3">Stato</th><th className="p-3">Scadenza</th><th className="p-3"></th></tr></thead>
            <tbody>
              {mine.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{t.title}</td>
                  <td className="p-3">{t.assignee}</td>
                  <td className="p-3">{t.status}</td>
                  <td className="p-3">{t.due}</td>
                  <td className="p-3">
                    {isCapo && t.status !== "Completato" && (
                      <button type="button" onClick={() => completeTask(t.id, role.name)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Completato</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section === "sicurezza") {
    return (
      <div className="space-y-4">
        {(isCapo || isDir) && (
          <form className="rounded-2xl border bg-white p-4 shadow-sm space-y-3" onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createSafety({ title: title.trim(), site: "Residenza Navigli", severity: (extra as "Alta" | "Media" | "Bassa") || "Media", createdBy: role.name });
            setTitle(""); setExtra("");
          }}>
            <p className="text-sm font-semibold">Nuova segnalazione sicurezza</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Cavo elettrico a terra" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <select value={extra || "Media"} onChange={(e) => setExtra(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm"><option>Alta</option><option>Media</option><option>Bassa</option></select>
            <button type="submit" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Segnala problema</button>
          </form>
        )}
        <div className="rounded-2xl border bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="p-3">Segnalazione</th><th className="p-3">Gravita</th><th className="p-3">Stato</th><th className="p-3">Da</th></tr></thead>
            <tbody>
              {ops.safety.length === 0 && <tr><td colSpan={4} className="p-4 text-slate-400 text-sm">Nessuna segnalazione.</td></tr>}
              {ops.safety.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{s.title}</td>
                  <td className="p-3">{s.severity}</td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3">{s.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section === "magazzino") {
    return (
      <div className="space-y-4">
        {(isCapo || isDir) && (
          <form className="rounded-2xl border bg-white p-4 shadow-sm space-y-3" onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createMaterial({ item: title.trim(), qty: extra.trim() || "1", site: "Residenza Navigli", createdBy: role.name });
            setTitle(""); setExtra("");
          }}>
            <p className="text-sm font-semibold">Richiedi materiale</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Cemento 32.5" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Quantita es. 20 sacchi" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Richiedi materiale</button>
          </form>
        )}
        <div className="rounded-2xl border bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="p-3">Materiale</th><th className="p-3">Qta</th><th className="p-3">Stato</th><th className="p-3">Da</th></tr></thead>
            <tbody>
              {ops.materials.length === 0 && <tr><td colSpan={4} className="p-4 text-slate-400 text-sm">Nessuna richiesta.</td></tr>}
              {ops.materials.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{m.item}</td>
                  <td className="p-3">{m.qty}</td>
                  <td className="p-3">{m.status}</td>
                  <td className="p-3">{m.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section === "spese") {
    return (
      <div className="space-y-4">
        {isAdmin && (
          <form className="rounded-2xl border bg-white p-4 shadow-sm space-y-3" onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createExpense({ label: title.trim(), amount: Number(amount) || 0, project: "Residenza Navigli", createdBy: role.name });
            setTitle("");
          }}>
            <p className="text-sm font-semibold">Proponi spesa (va in Approvazioni)</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Nolo piattaforma" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Invia in approvazione</button>
          </form>
        )}
        <div className="rounded-2xl border bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="p-3">Voce</th><th className="p-3">Importo</th><th className="p-3">Stato</th><th className="p-3">Da</th></tr></thead>
            <tbody>
              {ops.expenses.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{e.label}</td>
                  <td className="p-3">EUR {e.amount.toLocaleString("it-IT")}</td>
                  <td className="p-3">{e.status}</td>
                  <td className="p-3">{e.createdBy}</td>
                </tr>
              ))}
              {ops.expenses.length === 0 && <tr><td colSpan={4} className="p-4 text-slate-400 text-sm">Nessuna spesa.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section === "approvazioni") {
    return (
      <div className="rounded-2xl border bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="p-3">Richiesta</th><th className="p-3">Tipo</th><th className="p-3">Importo</th><th className="p-3">Stato</th><th className="p-3">Azioni</th></tr></thead>
          <tbody>
            {ops.approvals.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{a.title}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3">{a.amount != null ? `EUR ${a.amount.toLocaleString("it-IT")}` : "—"}</td>
                <td className="p-3">{a.status}</td>
                <td className="p-3 space-x-2">
                  {isDir && a.status === "In attesa" && (
                    <>
                      <button type="button" onClick={() => decideApproval(a.id, "Approvata", role.name)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Approva</button>
                      <button type="button" onClick={() => decideApproval(a.id, "Rifiutata", role.name)} className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">Rifiuta</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {ops.approvals.length === 0 && <tr><td colSpan={5} className="p-4 text-slate-400 text-sm">Nessuna approvazione in coda.</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
      Sezione {section}: usa Task, Sicurezza, Magazzino, Spese e Approvazioni per i flussi live tra ruoli.
    </div>
  );
}
