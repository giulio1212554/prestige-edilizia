export type LeadStatus = "nuova" | "in_lavorazione" | "chiusa";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "sopralluogo" | "preventivo" | "altro";
  status: LeadStatus;
  createdAt: string;
  read: boolean;
};

const globalStore = globalThis as unknown as {
  __prestigeLeads?: Lead[];
};

function store(): Lead[] {
  if (!globalStore.__prestigeLeads) {
    globalStore.__prestigeLeads = [
      {
        id: "demo-1",
        name: "Marco Bianchi",
        email: "marco.bianchi@email.it",
        phone: "+39 333 1112233",
        message: "Vorrei un sopralluogo per ristrutturazione completa appartamento 120 mq in zona Città Studi.",
        type: "sopralluogo",
        status: "nuova",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: false,
      },
      {
        id: "demo-2",
        name: "Laura Ferri",
        email: "laura.ferri@email.it",
        phone: "+39 340 9988776",
        message: "Richiesta preventivo per bagno suite e cucina open space, finiture di pregio.",
        type: "preventivo",
        status: "in_lavorazione",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
      },
      {
        id: "demo-3",
        name: "Andrea Conti",
        email: "andrea.conti@email.it",
        phone: "+39 349 5544332",
        message: "Informazioni su tempi e costi per nuova costruzione villa bifamiliare in provincia.",
        type: "altro",
        status: "nuova",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        read: false,
      },
    ];
  }
  return globalStore.__prestigeLeads;
}

export function listLeads(): Lead[] {
  return [...store()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addLead(
  input: Omit<Lead, "id" | "createdAt" | "status" | "read">
): Lead {
  const lead: Lead = {
    ...input,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "nuova",
    read: false,
    createdAt: new Date().toISOString(),
  };
  store().unshift(lead);
  return lead;
}

export function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "read">>
): Lead | null {
  const leads = store();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...patch };
  return leads[idx];
}

export function unreadCount(): number {
  return store().filter((l) => !l.read).length;
}
