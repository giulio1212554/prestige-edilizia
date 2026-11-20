/**
 * Generazione XML FatturaPA (struttura base).
 * DEMO: il file non viene trasmesso allo SdI.
 * Il PDF resta copia di cortesia, non sostituto della fattura elettronica.
 */

import type { FiscalDocument } from "./fiscal";
import { FISCAL_MODE } from "./fiscal";
import { company } from "@/data/company";

function esc(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function money(n: number) {
  return n.toFixed(2);
}

/** Progressivo numerazione (locale DEMO). */
export function nextInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  const re = new RegExp("^" + year + "/(\\d+)$");
  for (const n of existing) {
    const m = n.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return year + "/" + String(max + 1).padStart(5, "0");
}

export function buildFatturaPaXml(doc: FiscalDocument): {
  xml: string;
  fileName: string;
  mode: typeof FISCAL_MODE;
  disclaimer: string;
} {
  const num = doc.number || "BOZZA";
  const pivaCedente = (doc.issuer.vat || company.vat).replace(/^IT/i, "");
  const fileName = "IT" + pivaCedente + "_" + num.replace("/", "") + ".xml";

  const bodyLines = doc.items
    .map((it, i) => {
      const natura =
        it.vatRate === 0 && it.vatNature
          ? "<Natura>" + esc(it.vatNature) + "</Natura>"
          : "";
      return (
        "\n      <DettaglioLinee>" +
        "\n        <NumeroLinea>" +
        (i + 1) +
        "</NumeroLinea>" +
        "\n        <Descrizione>" +
        esc(it.description.slice(0, 1000)) +
        "</Descrizione>" +
        "\n        <Quantita>" +
        money(it.quantity) +
        "</Quantita>" +
        "\n        <PrezzoUnitario>" +
        money(it.unitPrice) +
        "</PrezzoUnitario>" +
        "\n        <PrezzoTotale>" +
        money(it.amount) +
        "</PrezzoTotale>" +
        "\n        <AliquotaIVA>" +
        money(it.vatRate) +
        "</AliquotaIVA>" +
        "\n        " +
        natura +
        "\n      </DettaglioLinee>"
      );
    })
    .join("");

  const riepilogo = doc.vatBreakdown
    .map((v) => {
      return (
        "\n      <DatiRiepilogo>" +
        "\n        <AliquotaIVA>" +
        money(v.rate) +
        "</AliquotaIVA>" +
        (v.nature ? "\n        <Natura>" + esc(v.nature) + "</Natura>" : "") +
        "\n        <ImponibileImporto>" +
        money(v.taxable) +
        "</ImponibileImporto>" +
        "\n        <Imposta>" +
        money(v.vat) +
        "</Imposta>" +
        "\n        <EsigibilitaIVA>I</EsigibilitaIVA>" +
        "\n      </DatiRiepilogo>"
      );
    })
    .join("");

  const cessionarioId = doc.customer.vat
    ? "<IdFiscaleIVA>\n            <IdPaese>IT</IdPaese>\n            <IdCodice>" +
      esc(doc.customer.vat.replace(/^IT/i, "")) +
      "</IdCodice>\n          </IdFiscaleIVA>"
    : "";
  const cessionarioCf = doc.customer.taxCode
    ? "<CodiceFiscale>" + esc(doc.customer.taxCode) + "</CodiceFiscale>"
    : "";

  const pecLine = doc.customer.pec
    ? "\n      <PECDestinatario>" + esc(doc.customer.pec) + "</PECDestinatario>"
    : "";

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    "<!-- GENERATO IN MODALITA DEMO — NON TRASMESSO AL SISTEMA DI INTERSCAMBIO -->\n" +
    "<!-- Prestige Edilizia: copia strutturale FatturaPA. -->\n" +
    '<pFatturaElettronica xmlns="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">\n' +
    "  <FatturaElettronicaHeader>\n" +
    "    <DatiTrasmissione>\n" +
    "      <IdTrasmittente>\n" +
    "        <IdPaese>IT</IdPaese>\n" +
    "        <IdCodice>" +
    esc(pivaCedente) +
    "</IdCodice>\n" +
    "      </IdTrasmittente>\n" +
    "      <ProgressivoInvio>" +
    esc(num.replace("/", "")) +
    "</ProgressivoInvio>\n" +
    "      <FormatoTrasmissione>FPR12</FormatoTrasmissione>\n" +
    "      <CodiceDestinatario>" +
    esc(doc.customer.sdiCode || "0000000") +
    "</CodiceDestinatario>" +
    pecLine +
    "\n    </DatiTrasmissione>\n" +
    "    <CedentePrestatore>\n" +
    "      <DatiAnagrafici>\n" +
    "        <IdFiscaleIVA>\n" +
    "          <IdPaese>IT</IdPaese>\n" +
    "          <IdCodice>" +
    esc(pivaCedente) +
    "</IdCodice>\n" +
    "        </IdFiscaleIVA>\n" +
    "        <Anagrafica>\n" +
    "          <Denominazione>" +
    esc(doc.issuer.name || company.legalName) +
    "</Denominazione>\n" +
    "        </Anagrafica>\n" +
    "        <RegimeFiscale>RF01</RegimeFiscale>\n" +
    "      </DatiAnagrafici>\n" +
    "      <Sede>\n" +
    "        <Indirizzo>" +
    esc(doc.issuer.address || company.address.street) +
    "</Indirizzo>\n" +
    "        <CAP>" +
    esc(doc.issuer.zip || company.address.zip) +
    "</CAP>\n" +
    "        <Comune>" +
    esc(doc.issuer.city || company.address.city) +
    "</Comune>\n" +
    "        <Provincia>" +
    esc(doc.issuer.province || "MI") +
    "</Provincia>\n" +
    "        <Nazione>IT</Nazione>\n" +
    "      </Sede>\n" +
    "    </CedentePrestatore>\n" +
    "    <CessionarioCommittente>\n" +
    "      <DatiAnagrafici>\n" +
    "        " +
    cessionarioId +
    "\n        " +
    cessionarioCf +
    "\n        <Anagrafica>\n" +
    "          <Denominazione>" +
    esc(doc.customer.name) +
    "</Denominazione>\n" +
    "        </Anagrafica>\n" +
    "      </DatiAnagrafici>\n" +
    "      <Sede>\n" +
    "        <Indirizzo>" +
    esc(doc.customer.address || "Da completare") +
    "</Indirizzo>\n" +
    "        <CAP>" +
    esc(doc.customer.zip || "00000") +
    "</CAP>\n" +
    "        <Comune>" +
    esc(doc.customer.city || "Da completare") +
    "</Comune>\n" +
    "        <Provincia>" +
    esc(doc.customer.province || "EE") +
    "</Provincia>\n" +
    "        <Nazione>" +
    esc(doc.customer.country || "IT") +
    "</Nazione>\n" +
    "      </Sede>\n" +
    "    </CessionarioCommittente>\n" +
    "  </FatturaElettronicaHeader>\n" +
    "  <FatturaElettronicaBody>\n" +
    "    <DatiGenerali>\n" +
    "      <DatiGeneraliDocumento>\n" +
    "        <TipoDocumento>TD01</TipoDocumento>\n" +
    "        <Divisa>EUR</Divisa>\n" +
    "        <Data>" +
    formatDate(doc.createdAt) +
    "</Data>\n" +
    "        <Numero>" +
    esc(num) +
    "</Numero>\n" +
    "        <ImportoTotaleDocumento>" +
    money(doc.grandTotal) +
    "</ImportoTotaleDocumento>\n" +
    "      </DatiGeneraliDocumento>\n" +
    "    </DatiGenerali>\n" +
    "    <DatiBeniServizi>" +
    bodyLines +
    riepilogo +
    "\n    </DatiBeniServizi>\n" +
    "  </FatturaElettronicaBody>\n" +
    "</pFatturaElettronica>\n";

  return {
    xml,
    fileName,
    mode: FISCAL_MODE,
    disclaimer:
      "XML generato in MODALITA DEMO. Non costituisce trasmissione al Sistema di Interscambio.",
  };
}

export function downloadTextFile(
  content: string,
  fileName: string,
  mime = "application/xml"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
