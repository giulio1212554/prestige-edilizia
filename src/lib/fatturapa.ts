/**
 * Generazione XML FatturaPA (struttura base).
 * DEMO: il file non viene trasmesso allo SdI. Serve come predisposizione tecnica.
 * Il PDF resta copia di cortesia, non sostituto della fattura elettronica.
 */

import type { FiscalDocument } from "./fiscal";
import { FISCAL_MODE } from "./fiscal";
import { company } from "@/data/company";

function esc(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function money(n: number) {
  return n.toFixed(2);
}

/** Progressivo numerazione (locale DEMO). In produzione: sequenza server/DB. */
export function nextInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  for (const n of existing) {
    const m = n.match(new RegExp(`^${year}/(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${year}/${String(max + 1).padStart(5, "0")}`;
}

export function buildFatturaPaXml(doc: FiscalDocument): {
  xml: string;
  fileName: string;
  mode: typeof FISCAL_MODE;
  disclaimer: string;
} {
  const num = doc.number || "BOZZA";
  const pivaCedente = (doc.issuer.vat || company.vat).replace(/^IT/i, "");
  const fileName = `IT${pivaCedente}_${num.replace("/", "")}.xml`;

  const bodyLines = doc.items
    .map((it, i) => {
      const natura =
        it.vatRate === 0 && it.vatNature
          ? `<Natura>${esc(it.vatNature)}</Natura>`
          : "";
      return `
      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${esc(it.description.slice(0, 1000))}</Descrizione>
        <Quantita>${money(it.quantity)}</Quantita>
        <PrezzoUnitario>${money(it.unitPrice)}</PrezzoUnitario>
        <PrezzoTotale>${money(it.amount)}</PrezzoTotale>
        <AliquotaIVA>${money(it.vatRate)}</AliquotaIVA>
        ${natura}
      </DettaglioLinee>`;
    })
    .join("");

  const riepilogo = doc.vatBreakdown
    .map(
      (v) => `
      <DatiRiepilogo>
        <AliquotaIVA>${money(v.rate)}</AliquotaIVA>
        ${v.nature ? `<Natura>${esc(v.nature)}</Natura>` : ""}
        <ImponibileImporto>${money(v.taxable)}</ImponibileImporto>
        <Imposta>${money(v.vat)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>`
    )
    .join("");

  const cessionarioId = doc.customer.vat
    ? `<IdFiscaleIVA>
            <IdPaese>IT</IdPaese>
            <IdCodice>${esc(doc.customer.vat.replace(/^IT/i, ""))}</IdCodice>
          </IdFiscaleIVA>`
    : "";
  const cessionarioCf = doc.customer.taxCode
    ? `<CodiceFiscale>${esc(doc.customer.taxCode)}</CodiceFiscale>`
    : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATO IN MODALITA DEMO — NON TRASMESSO AL SISTEMA DI INTERSCAMBIO -->
<!-- Prestige Edilizia: copia strutturale FatturaPA. Collegare un provider SdI per l'uso in produzione. -->
<pFatturaElettronica xmlns="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>${esc(pivaCedente)}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${esc(num.replace("/", ""))}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${esc(doc.customer.sdiCode || "0000000")}</CodiceDestinatario>
      ${doc.customer.pec ? `<PECDestinatario>${esc(doc.customer.pec)}</PECDestinatario>` : ""}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${esc(pivaCedente)}</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>${esc(doc.issuer.name || company.legalName)}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${esc(doc.issuer.address || company.address.street)}</Indirizzo>
        <CAP>${esc(doc.issuer.zip || company.address.zip)}</CAP>
        <Comune>${esc(doc.issuer.city || company.address.city)}</Comune>
        <Provincia>${esc(doc.issuer.province || "MI")}</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${cessionarioId}
        ${cessionarioCf}
        <Anagrafica>
          <Denominazione>${esc(doc.customer.name)}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${esc(doc.customer.address || "Da completare")}</Indirizzo>
        <CAP>${esc(doc.customer.zip || "00000")}</CAP>
        <Comune>${esc(doc.customer.city || "Da completare")}</Comune>
        <Provincia>${esc(doc.customer.province || "EE")}</Provincia>
        <Nazione>${esc(doc.customer.country || "IT")}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${formatDate(doc.createdAt)}</Data>
        <Numero>${esc(num)}</Numero>
        <ImportoTotaleDocumento>${money(doc.grandTotal)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      ${bodyLines}
      ${riepilogo}
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</pFatturaElettronica>
`;

  return {
    xml,
    fileName,
    mode: FISCAL_MODE,
    disclaimer:
      "XML generato in MODALITA DEMO. Non costituisce trasmissione al Sistema di Interscambio. Collegare un provider accreditato per l'invio reale e la conservazione a norma.",
  };
}

export function downloadTextFile(content: string, fileName: string, mime = "application/xml") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
