"use client";

import {
  seedProjects,
  seedTasks,
  seedQuality,
  seedSafety,
  seedInventory,
  seedEquipment,
  seedExpenses,
  seedApprovals,
  seedReports,
} from "@/data/admin-seed";

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

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3 font-semibold text-slate-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => (
                <td key={j} className="p-3 text-slate-700">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminModules({ section }: { section: Section }) {
  if (section === "progetti")
    return (
      <Table
        headers={["ID", "Progetto", "Tipo", "Città", "%", "Stato", "Budget", "PM"]}
        rows={seedProjects.map((p) => [
          p.id,
          p.name,
          p.type,
          p.city,
          p.progress + "%",
          p.status,
          "EUR " + p.budget.toLocaleString("it-IT"),
          p.pm,
        ])}
      />
    );
  if (section === "task")
    return (
      <Table
        headers={["ID", "Task", "Progetto", "Assegnato", "Scadenza", "Stato", "Priorità"]}
        rows={seedTasks.map((t) => [
          t.id,
          t.title,
          t.project,
          t.assignee,
          t.due,
          t.status,
          t.pri,
        ])}
      />
    );
  if (section === "qualita")
    return (
      <Table
        headers={["ID", "Controllo", "Progetto", "Esito", "Data", "Ispettore"]}
        rows={seedQuality.map((q) => [
          q.id,
          q.title,
          q.project,
          q.result,
          q.date,
          q.inspector,
        ])}
      />
    );
  if (section === "sicurezza")
    return (
      <Table
        headers={["ID", "Segnalazione", "Progetto", "Gravità", "Stato", "Data", "Da"]}
        rows={seedSafety.map((s) => [
          s.id,
          s.title,
          s.project,
          s.severity,
          s.status,
          s.reported,
          s.by,
        ])}
      />
    );
  if (section === "magazzino")
    return (
      <Table
        headers={["SKU", "Materiale", "Q.tà", "U.M.", "Ubicazione", "Min"]}
        rows={seedInventory.map((m) => [
          m.sku,
          m.name,
          m.qty,
          m.unit,
          m.location,
          m.min,
        ])}
      />
    );
  if (section === "attrezzature")
    return (
      <Table
        headers={["ID", "Attrezzatura", "Targa", "Stato", "Progetto"]}
        rows={seedEquipment.map((e) => [
          e.id,
          e.name,
          e.plate,
          e.status,
          e.project,
        ])}
      />
    );
  if (section === "spese")
    return (
      <Table
        headers={["ID", "Descrizione", "Progetto", "Importo", "Data", "Categoria"]}
        rows={seedExpenses.map((e) => [
          e.id,
          e.label,
          e.project,
          "EUR " + e.amount.toLocaleString("it-IT"),
          e.date,
          e.cat,
        ])}
      />
    );
  if (section === "approvazioni")
    return (
      <Table
        headers={["ID", "Documento", "Progetto", "Da", "Stato", "Data"]}
        rows={seedApprovals.map((a) => [
          a.id,
          a.title,
          a.project,
          a.from,
          a.status,
          a.date,
        ])}
      />
    );
  return (
    <Table
      headers={["ID", "Report", "Periodo", "Progetti", "Sintesi"]}
      rows={seedReports.map((r) => [
        r.id,
        r.title,
        r.week,
        r.projects,
        r.summary,
      ])}
    />
  );
}
