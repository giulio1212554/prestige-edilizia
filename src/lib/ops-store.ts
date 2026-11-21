"use client";

export type OpsTask = {
  id: string;
  title: string;
  project: string;
  assignee: string;
  assigneeRole: string;
  status: "Aperto" | "In corso" | "Completato";
  pri: "Alta" | "Media" | "Bassa";
  due: string;
  createdBy: string;
  createdAt: string;
};

export type OpsSafety = {
  id: string;
  title: string;
  site: string;
  severity: "Alta" | "Media" | "Bassa";
  status: "Aperto" | "In lavorazione" | "Chiuso";
  createdBy: string;
  createdAt: string;
};

export type OpsMaterial = {
  id: string;
  item: string;
  qty: string;
  site: string;
  status: "Richiesto" | "Approvato" | "In consegna" | "Consegnato";
  createdBy: string;
  createdAt: string;
};

export type OpsExpense = {
  id: string;
  label: string;
  amount: number;
  project: string;
  status: "Proposta" | "In approvazione" | "Approvata" | "Rifiutata";
  createdBy: string;
  createdAt: string;
};

export type OpsApproval = {
  id: string;
  type: "spesa" | "materiale" | "altro";
  refId: string;
  title: string;
  amount?: number;
  status: "In attesa" | "Approvata" | "Rifiutata";
  requestedBy: string;
  createdAt: string;
};

export type OpsQuality = {
  id: string;
  title: string;
  site: string;
  result: "Conforme" | "Non conforme" | "Da verificare";
  createdBy: string;
  createdAt: string;
};

export type OpsNotif = {
  id: string;
  text: string;
  forRoles: string[];
  read: boolean;
  createdAt: string;
};

export type OpsState = {
  tasks: OpsTask[];
  safety: OpsSafety[];
  materials: OpsMaterial[];
  expenses: OpsExpense[];
  approvals: OpsApproval[];
  quality: OpsQuality[];
  notifs: OpsNotif[];
};

const KEY = "pe-ops-v1";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function now() {
  return new Date().toISOString();
}

const seed: OpsState = {
  tasks: [
    {
      id: "T-1001",
      title: "Getto pilastri piano 2",
      project: "Residenza Navigli",
      assignee: "Luca Ferrari",
      assigneeRole: "capocantiere",
      status: "In corso",
      pri: "Alta",
      due: "2026-11-22",
      createdBy: "Marco Bianchi",
      createdAt: now(),
    },
    {
      id: "T-1002",
      title: "Tracciamento impianti bagno",
      project: "Residenza Navigli",
      assignee: "Luca Ferrari",
      assigneeRole: "capocantiere",
      status: "Aperto",
      pri: "Media",
      due: "2026-11-24",
      createdBy: "Marco Bianchi",
      createdAt: now(),
    },
  ],
  safety: [],
  quality: [
    {
      id: "Q-1001",
      title: "Controllo getto solaio piano 2",
      site: "Residenza Navigli",
      result: "Conforme",
      createdBy: "Sara Verdi",
      createdAt: now(),
    },
  ],
  materials: [],
  expenses: [],
  approvals: [],
  notifs: [
    {
      id: "N-1",
      text: "Benvenuto nel gestionale operativo Prestige",
      forRoles: ["direzione", "project_manager", "capocantiere", "amministrazione", "qualita_hse"],
      read: false,
      createdAt: now(),
    },
  ],
};

function read(): OpsState {
  if (typeof window === "undefined") return structuredClone(seed);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return structuredClone(seed);
    }
    const parsed = JSON.parse(raw) as OpsState;
    if (!parsed.quality) parsed.quality = structuredClone(seed.quality);
    return parsed;
  } catch {
    return structuredClone(seed);
  }
}

function write(state: OpsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("pe-ops"));
}

export function getOps(): OpsState {
  return read();
}

export function subscribeOps(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("pe-ops", h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener("pe-ops", h);
    window.removeEventListener("storage", h);
  };
}

function pushNotif(state: OpsState, text: string, forRoles: string[]) {
  state.notifs.unshift({
    id: uid("N"),
    text,
    forRoles,
    read: false,
    createdAt: now(),
  });
}

export function createTask(input: {
  title: string;
  project: string;
  assignee: string;
  assigneeRole: string;
  pri: OpsTask["pri"];
  due: string;
  createdBy: string;
}) {
  const s = read();
  const t: OpsTask = {
    id: uid("T"),
    title: input.title,
    project: input.project,
    assignee: input.assignee,
    assigneeRole: input.assigneeRole,
    status: "Aperto",
    pri: input.pri,
    due: input.due,
    createdBy: input.createdBy,
    createdAt: now(),
  };
  s.tasks.unshift(t);
  pushNotif(s, `Nuovo task: ${t.title} → ${t.assignee}`, [
    input.assigneeRole,
    "direzione",
    "project_manager",
  ]);
  write(s);
  return t;
}

export function completeTask(id: string, by: string) {
  const s = read();
  const t = s.tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = "Completato";
  pushNotif(s, `${by} ha completato: ${t.title}`, ["direzione", "project_manager"]);
  write(s);
}

export function createSafety(input: {
  title: string;
  site: string;
  severity: OpsSafety["severity"];
  createdBy: string;
}) {
  const s = read();
  const row: OpsSafety = {
    id: uid("S"),
    title: input.title,
    site: input.site,
    severity: input.severity,
    status: "Aperto",
    createdBy: input.createdBy,
    createdAt: now(),
  };
  s.safety.unshift(row);
  pushNotif(s, `Segnalazione sicurezza: ${row.title} (${row.severity})`, [
    "direzione",
    "project_manager",
    "qualita_hse",
  ]);
  write(s);
  return row;
}

export function createMaterial(input: {
  item: string;
  qty: string;
  site: string;
  createdBy: string;
}) {
  const s = read();
  const row: OpsMaterial = {
    id: uid("M"),
    item: input.item,
    qty: input.qty,
    site: input.site,
    status: "Richiesto",
    createdBy: input.createdBy,
    createdAt: now(),
  };
  s.materials.unshift(row);
  s.approvals.unshift({
    id: uid("A"),
    type: "materiale",
    refId: row.id,
    title: `Materiale: ${row.item} × ${row.qty}`,
    status: "In attesa",
    requestedBy: input.createdBy,
    createdAt: now(),
  });
  pushNotif(s, `Richiesta materiale: ${row.item} (${row.qty})`, [
    "direzione",
    "project_manager",
    "amministrazione",
  ]);
  write(s);
  return row;
}

export function createExpense(input: {
  label: string;
  amount: number;
  project: string;
  createdBy: string;
}) {
  const s = read();
  const row: OpsExpense = {
    id: uid("E"),
    label: input.label,
    amount: input.amount,
    project: input.project,
    status: "In approvazione",
    createdBy: input.createdBy,
    createdAt: now(),
  };
  s.expenses.unshift(row);
  s.approvals.unshift({
    id: uid("A"),
    type: "spesa",
    refId: row.id,
    title: `Spesa: ${row.label}`,
    amount: row.amount,
    status: "In attesa",
    requestedBy: input.createdBy,
    createdAt: now(),
  });
  pushNotif(s, `Spesa da approvare: ${row.label} · EUR ${row.amount}`, [
    "direzione",
    "project_manager",
  ]);
  write(s);
  return row;
}

export function decideApproval(
  id: string,
  decision: "Approvata" | "Rifiutata",
  by: string
) {
  const s = read();
  const a = s.approvals.find((x) => x.id === id);
  if (!a || a.status !== "In attesa") return;
  a.status = decision;
  if (a.type === "spesa") {
    const e = s.expenses.find((x) => x.id === a.refId);
    if (e) e.status = decision === "Approvata" ? "Approvata" : "Rifiutata";
  }
  if (a.type === "materiale") {
    const m = s.materials.find((x) => x.id === a.refId);
    if (m) m.status = decision === "Approvata" ? "Approvato" : "Richiesto";
  }
  pushNotif(s, `${by} ha ${decision.toLowerCase()}: ${a.title}`, [
    "direzione",
    "project_manager",
    "amministrazione",
    "capocantiere",
  ]);
  write(s);
}

export function createQuality(input: {
  title: string;
  site: string;
  result: OpsQuality["result"];
  createdBy: string;
}) {
  const s = read();
  const row: OpsQuality = {
    id: uid("Q"),
    title: input.title,
    site: input.site,
    result: input.result,
    createdBy: input.createdBy,
    createdAt: now(),
  };
  s.quality = s.quality || [];
  s.quality.unshift(row);
  pushNotif(s, `Controllo qualita: ${row.title} (${row.result})`, [
    "direzione",
    "project_manager",
    "qualita_hse",
    "capocantiere",
  ]);
  write(s);
  return row;
}

export function unreadNotifs(roleId: string) {
  return read().notifs.filter((n) => n.forRoles.includes(roleId) && !n.read).length;
}

export function markNotifsRead(roleId: string) {
  const s = read();
  s.notifs.forEach((n) => {
    if (n.forRoles.includes(roleId)) n.read = true;
  });
  write(s);
}
