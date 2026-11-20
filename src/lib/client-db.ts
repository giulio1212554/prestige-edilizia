/** Persistenza lato browser per demo (funziona su Vercel senza DB). */

export type LeadStatus =
  | "nuova"
  | "in_lavorazione"
  | "preventivo_inviato"
  | "accettato"
  | "chiusa";

export type DocStatus = "bozza" | "inviato" | "firmato";

export type QuoteDetails = {
  city?: string;
  workType?: string;
  sqm?: string;
  budget?: string;
  deadline?: string;
  urgent?: boolean;
  description?: string;
};

export type Lead = {
  id: string;
  accountCode: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "sopralluogo" | "preventivo" | "altro";
  status: LeadStatus;
  createdAt: string;
  read: boolean;
  details?: QuoteDetails;
};

export type Document = {
  id: string;
  leadId: string;
  type: "preventivo" | "fattura" | "contratto";
  title: string;
  amount: number;
  items: { label: string; amount: number }[];
  notes: string;
  status: DocStatus;
  createdAt: string;
  signedAt?: string;
  clientSignature?: string;
  /** Data URL PNG della firma disegnata al touch */
  signatureImage?: string;
};

const LEADS_KEY = "pe_leads_v1";
const DOCS_KEY = "pe_docs_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const seedLeads: Lead[] = [
  {
    id: "demo-1",
    accountCode: "PE-1001",
    name: "Marco Bianchi",
    email: "marco.bianchi@email.it",
    phone: "+39 333 1112233",
    message: "Ristrutturazione completa appartamento 120 mq.",
    type: "preventivo",
    status: "nuova",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    details: {
      city: "Milano",
      workType: "Appartamento completo",
      sqm: "100-150",
      budget: "50.000 - 100.000",
      deadline: "3-6 mesi",
      urgent: false,
    },
  },
  {
    id: "demo-2",
    accountCode: "PE-1002",
    name: "Laura Ferri",
    email: "laura.ferri@email.it",
    phone: "+39 340 9988776",
    message: "Bagno suite e cucina open space.",
    type: "preventivo",
    status: "preventivo_inviato",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    details: {
      city: "Monza",
      workType: "Bagno + cucina",
      sqm: "50-80",
      budget: "20.000 - 40.000",
      urgent: true,
    },
  },
];

const seedDocs: Document[] = [
  {
    id: "doc-demo-1",
    leadId: "demo-2",
    type: "preventivo",
    title: "Preventivo bagno + cucina",
    amount: 28500,
    items: [
      { label: "Demolizioni e smaltimento", amount: 3200 },
      { label: "Impianti idraulici/elettrici", amount: 6800 },
      { label: "Rivestimenti e finiture", amount: 12500 },
      { label: "Sanitari e rubinetteria", amount: 4200 },
      { label: "Manodopera e direzione lavori", amount: 1800 },
    ],
    notes: "Validità 30 giorni. IVA esclusa.",
    status: "inviato",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

function ensureBrowser() {
  return typeof window !== "undefined";
}

export function listLeads(): Lead[] {
  if (!ensureBrowser()) return seedLeads;
  let leads = safeParse<Lead[]>(localStorage.getItem(LEADS_KEY), []);
  if (leads.length === 0) {
    leads = seedLeads;
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveLeads(leads: Lead[]) {
  if (!ensureBrowser()) return;
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function addLead(
  input: Omit<Lead, "id" | "createdAt" | "status" | "read" | "accountCode"> & {
    accountCode?: string;
  }
): Lead {
  const existing = listLeads();
  const maxNum = existing.reduce((m, l) => {
    const n = parseInt(l.accountCode.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  const lead: Lead = {
    ...input,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    accountCode: input.accountCode || `PE-${maxNum + 1}`,
    status: "nuova",
    read: false,
    createdAt: new Date().toISOString(),
  };
  saveLeads([lead, ...existing]);
  return lead;
}

export function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "read">>
): Lead | null {
  const leads = listLeads();
  const i = leads.findIndex((l) => l.id === id);
  if (i < 0) return null;
  leads[i] = { ...leads[i], ...patch };
  saveLeads(leads);
  return leads[i];
}

export function getLeadByCode(code: string): Lead | null {
  const c = code.trim().toUpperCase();
  return listLeads().find((l) => l.accountCode.toUpperCase() === c) || null;
}

export function getLead(id: string): Lead | null {
  return listLeads().find((l) => l.id === id) || null;
}

export function unreadCount(): number {
  return listLeads().filter((l) => !l.read).length;
}

export function listDocs(leadId?: string): Document[] {
  if (!ensureBrowser()) return seedDocs;
  let docs = safeParse<Document[]>(localStorage.getItem(DOCS_KEY), []);
  if (docs.length === 0) {
    docs = seedDocs;
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }
  const sorted = [...docs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return leadId ? sorted.filter((d) => d.leadId === leadId) : sorted;
}

function saveDocs(docs: Document[]) {
  if (!ensureBrowser()) return;
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function addDoc(
  input: Omit<Document, "id" | "createdAt" | "status"> & { status?: DocStatus }
): Document {
  const doc: Document = {
    ...input,
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: input.status || "bozza",
    createdAt: new Date().toISOString(),
  };
  saveDocs([doc, ...listDocs()]);
  return doc;
}

export function updateDoc(
  id: string,
  patch: Partial<
    Pick<
      Document,
      | "status"
      | "signedAt"
      | "clientSignature"
      | "signatureImage"
      | "notes"
      | "amount"
      | "items"
      | "title"
    >
  >
): Document | null {
  const docs = listDocs();
  const i = docs.findIndex((d) => d.id === id);
  if (i < 0) return null;
  docs[i] = { ...docs[i], ...patch };
  saveDocs(docs);
  return docs[i];
}

export function getDoc(id: string): Document | null {
  return listDocs().find((d) => d.id === id) || null;
}
