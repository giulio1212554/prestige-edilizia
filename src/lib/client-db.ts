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
  taxCode?: string;
  vatNumber?: string;
  pec?: string;
  sdiCode?: string;
  address?: string;
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
  /** PIN demo per area cliente. */
  accessPin?: string;
};

export type PaymentMilestone = {
  label: string;
  percent: number;
  amount: number;
  dueDate?: string;
  paid?: boolean;
  paidAt?: string;
};

export type Document = {
  id: string;
  leadId: string;
  type:
    | "preventivo"
    | "fattura"
    | "contratto"
    | "conferma_ordine"
    | "sal"
    | "fattura_elettronica"
    | "ricevuta"
    | "pagamento";
  title: string;
  amount: number;
  items: { label: string; amount: number }[];
  notes: string;
  status: DocStatus;
  createdAt: string;
  signedAt?: string;
  clientSignature?: string;
  signatureImage?: string;
  vatExcluded?: boolean;
  vatRate?: number;
  paymentSchedule?: PaymentMilestone[];
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
    accessPin: "navigli",
    name: "Marco Rossi",
    email: "marco.rossi@email.it",
    phone: "+39 333 111 2233",
    message: "Ristrutturazione appartamento Navigli, Milano.",
    type: "sopralluogo",
    status: "nuova",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
    details: {
      city: "Milano",
      workType: "Ristrutturazione completa",
      sqm: "80-120",
      budget: "40.000 - 80.000",
    },
  },
  {
    id: "demo-2",
    accountCode: "PE-1002",
    accessPin: "monza",
    name: "Laura Ferrari",
    email: "laura.ferrari@email.it",
    phone: "+39 340 555 6677",
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
      taxCode: "FRRLRA85B41F704Z",
      sdiCode: "0000000",
    },
  },
];

const seedDocs: Document[] = [
  {
    id: "doc-demo-1",
    leadId: "demo-2",
    type: "preventivo",
    title: "Preventivo ristrutturazione bagno + cucina",
    amount: 28500,
    items: [
      { label: "Demolizioni selettive e smaltimento", amount: 3200 },
      { label: "Impianto idraulico e scarichi", amount: 4800 },
      { label: "Impianto elettrico a norma", amount: 3600 },
      { label: "Pavimenti e rivestimenti", amount: 7200 },
      { label: "Sanitari e box doccia", amount: 5200 },
      { label: "Collegamenti cucina e collaudo", amount: 2500 },
      { label: "Manodopera e direzione lavori", amount: 2000 },
    ],
    notes: "Validita 30 giorni. Importi IVA esclusa.",
    status: "inviato",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    vatExcluded: true,
    vatRate: 10,
    paymentSchedule: [
      { label: "Acconto alla firma del contratto", percent: 30, amount: 8550 },
      { label: "SAL impianti e grezzo avanzato", percent: 40, amount: 11400 },
      { label: "Saldo collaudo finale", percent: 30, amount: 8550 },
    ],
  },
];

function ensureBrowser() {
  return typeof window !== "undefined";
}

export function listLeads(): Lead[] {
  if (!ensureBrowser()) return seedLeads;
  let leads = safeParse<Lead[]>(localStorage.getItem(LEADS_KEY), []);
  if (!leads.length) {
    leads = structuredClone(seedLeads);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return leads;
  }
  // Aggiorna accessPin mancanti dai seed (localStorage vecchio)
  let changed = false;
  for (const s of seedLeads) {
    const i = leads.findIndex((l) => l.accountCode === s.accountCode);
    if (i >= 0 && !leads[i].accessPin && s.accessPin) {
      leads[i] = { ...leads[i], accessPin: s.accessPin, details: leads[i].details || s.details };
      changed = true;
    }
  }
  if (changed) localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  return leads;
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
  const leads = listLeads();
  let maxNum = 1000;
  for (const l of leads) {
    const n = parseInt(l.accountCode.replace(/\D/g, ""), 10);
    if (!Number.isNaN(n) && n > maxNum) maxNum = n;
  }
  const lead: Lead = {
    ...input,
    id: `lead-${Date.now()}`,
    accountCode: input.accountCode || `PE-${maxNum + 1}`,
    status: "nuova",
    createdAt: new Date().toISOString(),
    read: false,
  };
  leads.unshift(lead);
  saveLeads(leads);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const leads = listLeads();
  const i = leads.findIndex((l) => l.id === id);
  if (i < 0) return null;
  leads[i] = { ...leads[i], ...patch };
  saveLeads(leads);
  return leads[i];
}

export function getLead(id: string): Lead | null {
  return listLeads().find((l) => l.id === id) || null;
}

export function getLeadByCode(code: string): Lead | null {
  const c = code.trim().toUpperCase();
  return listLeads().find((l) => l.accountCode.toUpperCase() === c) || null;
}

/** Password demo note per codice (sempre valide, anche se localStorage e vecchio). */
const DEMO_PINS: Record<string, string[]> = {
  "PE-1001": ["navigli", "1001", "demo"],
  "PE-1002": ["monza", "1002", "demo"],
};

export function authClient(code: string, pin: string): Lead | null {
  const c = code.trim().toUpperCase();
  const p = pin.trim().toLowerCase();
  if (!c || !p) return null;

  const allowed = DEMO_PINS[c];
  if (allowed && allowed.includes(p)) {
    const lead = getLeadByCode(c);
    if (lead) return lead;
    const fromSeed = seedLeads.find((l) => l.accountCode.toUpperCase() === c);
    if (fromSeed) {
      const leads = listLeads();
      if (!leads.some((l) => l.accountCode.toUpperCase() === c)) {
        leads.unshift({ ...fromSeed });
        saveLeads(leads);
      }
      return getLeadByCode(c) || fromSeed;
    }
  }

  const lead = getLeadByCode(c);
  if (!lead) return null;
  const candidates = [
    lead.accessPin,
    lead.accountCode.replace(/\D/g, ""),
    "demo",
  ]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase());
  if (!candidates.includes(p)) return null;
  return lead;
}

export function unreadCount(): number {
  return listLeads().filter((l) => !l.read).length;
}

export function listDocs(leadId?: string): Document[] {
  if (!ensureBrowser()) return seedDocs;
  let docs = safeParse<Document[]>(localStorage.getItem(DOCS_KEY), []);
  if (!docs.length) {
    docs = seedDocs;
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }
  // Assicura doc seed per demo-2 se manca
  if (!docs.some((d) => d.id === "doc-demo-1")) {
    docs = [...seedDocs, ...docs];
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }
  if (leadId) return docs.filter((d) => d.leadId === leadId);
  return docs;
}

export function saveDocs(docs: Document[]) {
  if (!ensureBrowser()) return;
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function addDoc(
  input: Omit<Document, "id" | "createdAt"> & { id?: string }
): Document {
  const docs = listDocs();
  const doc: Document = {
    ...input,
    id: input.id || `doc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  docs.unshift(doc);
  saveDocs(docs);
  return doc;
}

export function updateDoc(id: string, patch: Partial<Document>): Document | null {
  const docs = listDocs();
  const i = docs.findIndex((d) => d.id === id);
  if (i < 0) return null;
  docs[i] = { ...docs[i], ...patch };
  saveDocs(docs);
  return docs[i];
}
