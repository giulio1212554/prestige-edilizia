/**
 * Layer fiscale sopra client-db (compatibile con documenti esistenti).
 */
import {
  listDocs,
  updateDoc,
  getLead,
  type Document,
  type Lead,
} from "@/lib/client-db";
import type {
  AuditEntry,
  DocKind,
  DocLifecycle,
  FiscalDocument,
  LineItem,
  PartyFiscal,
  SdiMeta,
} from "@/lib/fiscal";
import { computeTotals } from "@/lib/fiscal";
import { company } from "@/data/company";

export function issuerParty(): PartyFiscal {
  return {
    name: company.legalName,
    vat: company.vat,
    address: company.address.street,
    city: company.address.city,
    zip: company.address.zip,
    province: "MI",
    country: "IT",
    email: company.email,
  };
}

export function leadToCustomer(lead: Lead): PartyFiscal {
  return {
    name: lead.name,
    email: lead.email,
    taxCode: lead.details?.taxCode,
    vat: (lead.details as { vatNumber?: string } | undefined)?.vatNumber,
    pec: (lead.details as { pec?: string } | undefined)?.pec,
    sdiCode:
      (lead.details as { sdiCode?: string } | undefined)?.sdiCode || "0000000",
    address: (lead.details as { address?: string } | undefined)?.address,
    city: lead.details?.city,
    country: "IT",
  };
}

function asKind(d: Document): DocKind {
  const t = d.type as string;
  if (t === "fattura") return "fattura_elettronica";
  if (
    t === "preventivo" ||
    t === "contratto" ||
    t === "conferma_ordine" ||
    t === "sal" ||
    t === "fattura_elettronica" ||
    t === "ricevuta" ||
    t === "pagamento"
  )
    return t;
  return "preventivo";
}

function asLifecycle(d: Document): DocLifecycle {
  if ((d as Document & { lifecycle?: DocLifecycle }).lifecycle)
    return (d as Document & { lifecycle?: DocLifecycle }).lifecycle!;
  if (d.status === "firmato") return "accettato";
  if (d.status === "inviato") return "inviato_cliente";
  return "bozza";
}

export function toFiscalView(doc: Document, lead?: Lead | null): FiscalDocument {
  const ext = doc as Document & {
    lineItems?: LineItem[];
    acceptance?: FiscalDocument["acceptance"];
    auditLog?: AuditEntry[];
    sdi?: SdiMeta;
    number?: string;
    taxableAmount?: number;
    vatTotal?: number;
    grandTotal?: number;
    customerFiscal?: PartyFiscal;
  };
  const lineItems: LineItem[] =
    ext.lineItems ||
    doc.items.map((it, i) => ({
      id: `li-${i}`,
      description: it.label,
      quantity: 1,
      unitPrice: it.amount,
      vatRate: doc.vatRate ?? 10,
      amount: it.amount,
    }));
  const totals = computeTotals(lineItems);
  return {
    id: doc.id,
    leadId: doc.leadId,
    kind: asKind(doc),
    lifecycle: asLifecycle(doc),
    number: ext.number,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: (doc as { updatedAt?: string }).updatedAt || doc.createdAt,
    notes: doc.notes,
    issuer: issuerParty(),
    customer:
      ext.customerFiscal ||
      (lead ? leadToCustomer(lead) : { name: "Cliente", country: "IT" }),
    items: lineItems,
    taxableAmount: ext.taxableAmount ?? totals.taxableAmount,
    vatBreakdown: totals.vatBreakdown,
    vatTotal: ext.vatTotal ?? totals.vatTotal,
    grandTotal: ext.grandTotal ?? totals.grandTotal,
    vatExcludedDisplay: doc.vatExcluded !== false,
    paymentSchedule: doc.paymentSchedule,
    acceptance: ext.acceptance,
    auditLog: ext.auditLog || [],
    sdi: ext.sdi,
  };
}

export function fiscalDashboard() {
  const docs = listDocs();
  const life = (d: Document) => asLifecycle(d);
  const by = (pred: (d: Document) => boolean) => docs.filter(pred);
  return {
    inPreparazione: by(
      (d) =>
        life(d) === "bozza" ||
        life(d) === "in_preparazione" ||
        d.status === "bozza"
    ),
    firmatiAccettati: by(
      (d) =>
        life(d) === "accettato" ||
        d.status === "firmato" ||
        !!(d as { acceptance?: unknown }).acceptance
    ),
    fattureTrasmesse: by(
      (d) =>
        life(d) === "trasmessa_sdi" ||
        (d as { sdi?: SdiMeta }).sdi?.transmissionStatus === "trasmessa"
    ),
    fattureConsegnate: by(
      (d) =>
        life(d) === "consegnata_sdi" ||
        (d as { sdi?: SdiMeta }).sdi?.transmissionStatus === "consegnata"
    ),
    fattureScartate: by(
      (d) =>
        life(d) === "scartata_sdi" ||
        (d as { sdi?: SdiMeta }).sdi?.transmissionStatus === "scartata"
    ),
    pagamentiRicevuti: by(
      (d) =>
        life(d) === "pagata" ||
        d.type === ("pagamento" as Document["type"]) ||
        d.type === ("ricevuta" as Document["type"])
    ),
    pagamentiDaRicevere: by((d) => {
      if (!d.paymentSchedule?.length) return false;
      return d.paymentSchedule.some((p) => !(p as { paid?: boolean }).paid);
    }),
    all: docs,
  };
}
