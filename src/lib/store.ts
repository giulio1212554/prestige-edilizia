export type LeadStatus =
  | "nuova"
  | "in_lavorazione"
  | "preventivo_inviato"
  | "accettato"
  | "chiusa";

export type DocumentType = "preventivo" | "fattura" | "contratto";

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
  type: DocumentType;
  title: string;
  amount: number;
  items: { label: string; amount: number }[];
  notes: string;
  status: DocStatus;
  createdAt: string;
  signedAt?: string;
  clientSignature?: string;
};

const g = globalThis as unknown as {
  __peLeads?: Lead[];
  __peDocs?: Document[];
};

function leads(): Lead[] {
  if (!g.__peLeads) {
    g.__peLeads = [
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
  }
  return g.__peLeads;
}

function docs(): Document[] {
  if (!g.__peDocs) {
    g.__peDocs = [
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
  }
  return g.__peDocs;
}

export function listLeads(): Lead[] {
  return [...leads()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLead(id: string): Lead | null {
  return leads().find((l) => l.id === id) || null;
}

export function getLeadByCode(code: string): Lead | null {
  const c = code.trim().toUpperCase();
  return leads().find((l) => l.accountCode.toUpperCase() === c) || null;
}

export function addLead(
  input: Omit<Lead, "id" | "createdAt" | "status" | "read" | "accountCode"> & {
    accountCode?: string;
  }
): Lead {
  const n = leads().length + 1001;
  const lead: Lead = {
    ...input,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    accountCode: input.accountCode || `PE-${n}`,
    status: "nuova",
    read: false,
    createdAt: new Date().toISOString(),
  };
  leads().unshift(lead);
  return lead;
}

export function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "read">>
): Lead | null {
  const arr = leads();
  const i = arr.findIndex((l) => l.id === id);
  if (i < 0) return null;
  arr[i] = { ...arr[i], ...patch };
  return arr[i];
}

export function unreadCount(): number {
  return leads().filter((l) => !l.read).length;
}

export function listDocs(leadId?: string): Document[] {
  const all = [...docs()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return leadId ? all.filter((d) => d.leadId === leadId) : all;
}

export function getDoc(id: string): Document | null {
  return docs().find((d) => d.id === id) || null;
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
  docs().unshift(doc);
  return doc;
}

export function updateDoc(
  id: string,
  patch: Partial<
    Pick<Document, "status" | "signedAt" | "clientSignature" | "notes" | "amount" | "items" | "title">
  >
): Document | null {
  const arr = docs();
  const i = arr.findIndex((d) => d.id === id);
  if (i < 0) return null;
  arr[i] = { ...arr[i], ...patch };
  return arr[i];
}
