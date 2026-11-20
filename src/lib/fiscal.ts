/**
 * Modulo fiscale / legale — predisposizione normativa italiana.
 * MODALITA DEMO: nessuna trasmissione reale allo SdI, nessuna FEA/FEQ qualificata,
 * nessuna conservazione a norma attiva finche non si collega un provider.
 */

export const FISCAL_MODE = "DEMO" as const;

export type DocKind =
  | "preventivo"
  | "contratto"
  | "conferma_ordine"
  | "sal"
  | "fattura_elettronica"
  | "ricevuta"
  | "pagamento";

export type DocLifecycle =
  | "bozza"
  | "in_preparazione"
  | "inviato_cliente"
  | "accettato"
  | "rifiutato"
  | "pronta_trasmissione"
  | "trasmessa_sdi"
  | "consegnata_sdi"
  | "scartata_sdi"
  | "pagata"
  | "parzialmente_pagata"
  | "annullata";

export type VatNature =
  | "N1"
  | "N2.1"
  | "N2.2"
  | "N3.1"
  | "N3.2"
  | "N3.3"
  | "N3.4"
  | "N3.5"
  | "N3.6"
  | "N4"
  | "N5"
  | "N6.1"
  | "N6.2"
  | "N6.3"
  | "N6.4"
  | "N6.5"
  | "N6.6"
  | "N6.7"
  | "N6.8"
  | "N6.9"
  | "N7"
  | null;

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate: number;
  vatNature?: VatNature;
  amount: number;
};

export type PaymentMilestone = {
  label: string;
  percent: number;
  amount: number;
  dueDate?: string;
  paid?: boolean;
  paidAt?: string;
};

export type PartyFiscal = {
  name: string;
  vat?: string;
  taxCode?: string;
  address?: string;
  city?: string;
  zip?: string;
  province?: string;
  country?: string;
  email?: string;
  pec?: string;
  sdiCode?: string;
};

export type AcceptanceRecord = {
  kind: "accettazione_semplice_tracciata";
  signerName: string;
  signerEmail?: string;
  consentedAt: string;
  documentId: string;
  documentNumber?: string;
  documentHash: string;
  userAgent?: string;
  graphicTraceDataUrl?: string;
  notes?: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  action: string;
  detail?: string;
  actor?: string;
};

export type SdiMeta = {
  providerConnected: boolean;
  progressiveNumber?: string;
  xmlGeneratedAt?: string;
  xmlFileName?: string;
  transmissionStatus:
    | "non_applicabile"
    | "non_trasmessa_demo"
    | "in_coda"
    | "trasmessa"
    | "consegnata"
    | "scartata"
    | "mancata_consegna";
  sdiNotifications: { at: string; code: string; message: string }[];
  lastError?: string;
};

export type FiscalDocument = {
  id: string;
  leadId: string;
  kind: DocKind;
  lifecycle: DocLifecycle;
  number?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  issuer: PartyFiscal;
  customer: PartyFiscal;
  items: LineItem[];
  taxableAmount: number;
  vatBreakdown: { rate: number; nature?: VatNature; taxable: number; vat: number }[];
  vatTotal: number;
  grandTotal: number;
  vatExcludedDisplay?: boolean;
  paymentSchedule?: PaymentMilestone[];
  acceptance?: AcceptanceRecord;
  auditLog: AuditEntry[];
  sdi?: SdiMeta;
  relatedDocId?: string;
};

export function docKindLabel(k: DocKind): string {
  const map: Record<DocKind, string> = {
    preventivo: "Preventivo",
    contratto: "Contratto",
    conferma_ordine: "Conferma d'ordine",
    sal: "Stato avanzamento lavori",
    fattura_elettronica: "Fattura elettronica",
    ricevuta: "Ricevuta",
    pagamento: "Pagamento",
  };
  return map[k];
}

export function lifecycleLabel(s: DocLifecycle): string {
  const map: Record<DocLifecycle, string> = {
    bozza: "Bozza",
    in_preparazione: "In preparazione",
    inviato_cliente: "Inviato al cliente",
    accettato: "Accettato",
    rifiutato: "Rifiutato",
    pronta_trasmissione: "Pronta per SdI (provider)",
    trasmessa_sdi: "Trasmessa SdI",
    consegnata_sdi: "Consegnata SdI",
    scartata_sdi: "Scartata SdI",
    pagata: "Pagata",
    parzialmente_pagata: "Parzialmente pagata",
    annullata: "Annullata",
  };
  return map[s];
}

export function computeTotals(items: LineItem[]) {
  const byRate = new Map<
    string,
    { rate: number; nature?: VatNature; taxable: number; vat: number }
  >();
  let taxableAmount = 0;
  for (const it of items) {
    const imponibile = Math.round(it.quantity * it.unitPrice * 100) / 100;
    taxableAmount += imponibile;
    const key = `${it.vatRate}|${it.vatNature || ""}`;
    const prev = byRate.get(key) || {
      rate: it.vatRate,
      nature: it.vatNature || undefined,
      taxable: 0,
      vat: 0,
    };
    prev.taxable += imponibile;
    prev.vat += Math.round(imponibile * (it.vatRate / 100) * 100) / 100;
    byRate.set(key, prev);
  }
  const vatBreakdown = [...byRate.values()].map((v) => ({
    ...v,
    taxable: Math.round(v.taxable * 100) / 100,
    vat: Math.round(v.vat * 100) / 100,
  }));
  const vatTotal =
    Math.round(vatBreakdown.reduce((s, v) => s + v.vat, 0) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + vatTotal) * 100) / 100;
  return {
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    vatBreakdown,
    vatTotal,
    grandTotal,
  };
}

export async function sha256Hex(payload: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(payload);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = (h * 31 + payload.charCodeAt(i)) >>> 0;
  return `demo-hash-${h.toString(16)}`;
}

export function documentFingerprint(
  doc: Pick<
    FiscalDocument,
    | "id"
    | "kind"
    | "number"
    | "title"
    | "taxableAmount"
    | "vatTotal"
    | "grandTotal"
    | "items"
    | "customer"
  >
): string {
  return JSON.stringify({
    id: doc.id,
    kind: doc.kind,
    number: doc.number,
    title: doc.title,
    taxableAmount: doc.taxableAmount,
    vatTotal: doc.vatTotal,
    grandTotal: doc.grandTotal,
    items: doc.items,
    customer: doc.customer,
  });
}
