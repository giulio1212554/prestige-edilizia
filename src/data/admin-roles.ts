export type AdminRoleId =
  | "project_manager"
  | "capocantiere"
  | "amministrazione"
  | "qualita_hse"
  | "direzione";

export type AdminNavId =
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

export type AdminRole = {
  id: AdminRoleId;
  name: string;
  title: string;
  blurb: string;
  color: string;
  initials: string;
  /** Sezioni visibili in sidebar (oltre a dashboard sempre presente se inclusa) */
  access: AdminNavId[];
  enabled: boolean;
};

export const ADMIN_ROLES: AdminRole[] = [
  {
    id: "project_manager",
    name: "Marco Bianchi",
    title: "Project Manager",
    blurb: "Progetti, task, approvazioni, qualità e report",
    color: "bg-blue-600",
    initials: "MB",
    access: [
      "dashboard",
      "progetti",
      "task",
      "approvazioni",
      "qualita",
      "report",
    ],
    enabled: true,
  },
  {
    id: "capocantiere",
    name: "Luca Ferrari",
    title: "Capocantiere",
    blurb: "Task, magazzino, attrezzature, sicurezza",
    color: "bg-amber-600",
    initials: "LF",
    access: [
      "dashboard",
      "task",
      "magazzino",
      "attrezzature",
      "sicurezza",
      "progetti",
    ],
    enabled: false,
  },
  {
    id: "amministrazione",
    name: "Elena Rossi",
    title: "Amministrazione",
    blurb: "Richieste, documenti, fiscale, spese",
    color: "bg-emerald-600",
    initials: "ER",
    access: [
      "dashboard",
      "richieste",
      "documenti",
      "fiscale",
      "spese",
      "report",
    ],
    enabled: false,
  },
  {
    id: "qualita_hse",
    name: "Sara Verdi",
    title: "Qualità & HSE",
    blurb: "Controlli qualità e sicurezza cantiere",
    color: "bg-rose-600",
    initials: "SV",
    access: ["dashboard", "qualita", "sicurezza", "progetti", "report"],
    enabled: false,
  },
  {
    id: "direzione",
    name: "Andrea Prestige",
    title: "Direzione",
    blurb: "Accesso completo a tutte le sezioni",
    color: "bg-slate-800",
    initials: "AP",
    access: [
      "dashboard",
      "progetti",
      "richieste",
      "task",
      "documenti",
      "fiscale",
      "qualita",
      "sicurezza",
      "magazzino",
      "attrezzature",
      "spese",
      "approvazioni",
      "report",
    ],
    enabled: false,
  },
];

export const ROLE_STORAGE_KEY = "pe-admin-role";

export function getRoleById(id: string | null): AdminRole | null {
  if (!id) return null;
  return ADMIN_ROLES.find((r) => r.id === id) || null;
}
