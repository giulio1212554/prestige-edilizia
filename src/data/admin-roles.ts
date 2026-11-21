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
  access: AdminNavId[];
  enabled: boolean;
};

export const ADMIN_ROLES: AdminRole[] = [
  {
    id: "direzione",
    name: "Andrea Prestige",
    title: "Direzione",
    blurb: "Accesso completo: vede e approva tutto in tempo reale",
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
    enabled: true,
  },
  {
    id: "project_manager",
    name: "Marco Bianchi",
    title: "Project Manager",
    blurb: "Crea task, vede segnalazioni, approva con la Direzione",
    color: "bg-blue-600",
    initials: "MB",
    access: [
      "dashboard",
      "progetti",
      "task",
      "approvazioni",
      "qualita",
      "sicurezza",
      "magazzino",
      "report",
    ],
    enabled: true,
  },
  {
    id: "capocantiere",
    name: "Luca Ferrari",
    title: "Capocantiere",
    blurb: "Task suoi, segnalazioni, richieste materiale — pensato per il telefono",
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
    enabled: true,
  },
  {
    id: "amministrazione",
    name: "Elena Rossi",
    title: "Amministrazione",
    blurb: "Propone spese che la Direzione approva in Approvazioni",
    color: "bg-emerald-600",
    initials: "ER",
    access: [
      "dashboard",
      "richieste",
      "documenti",
      "fiscale",
      "spese",
      "approvazioni",
    ],
    enabled: true,
  },
  {
    id: "qualita_hse",
    name: "Sara Verdi",
    title: "Qualita / HSE",
    blurb: "Controlli qualita, non conformita e sicurezza di cantiere",
    color: "bg-violet-600",
    initials: "SV",
    access: [
      "dashboard",
      "qualita",
      "sicurezza",
      "progetti",
      "report",
      "task",
    ],
    enabled: true,
  },
];

export const ROLE_STORAGE_KEY = "pe-admin-role";

export function getRoleById(id: string | null | undefined): AdminRole | null {
  if (!id) return null;
  return ADMIN_ROLES.find((r) => r.id === id) ?? null;
}
