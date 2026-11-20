import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { company } from "@/data/company";
import type { Document, Lead } from "@/lib/client-db";

function euro(n: number) {
  return `EUR ${n.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function docLabel(type: Document["type"]) {
  if (type === "fattura") return "FATTURA";
  if (type === "contratto") return "CONTRATTO / PROGETTO";
  return "PREVENTIVO";
}

export async function buildDocumentPdf(
  doc: Document,
  lead: Lead,
  opts?: { signedBy?: string; signedAt?: string }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const width = page.getWidth() - margin * 2;
  let y = page.getHeight() - margin;

  const draw = (
    text: string,
    x: number,
    yy: number,
    size = 10,
    bold = false,
    color = rgb(0.12, 0.12, 0.12)
  ) => {
    page.drawText(text, {
      x,
      y: yy,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  // Header
  draw(company.legalName, margin, y, 16, true, rgb(0.55, 0.4, 0.22));
  y -= 16;
  draw(company.address.full, margin, y, 9, false, rgb(0.35, 0.35, 0.35));
  y -= 12;
  draw(
    `P.IVA ${company.vat}  ·  ${company.email}  ·  ${company.phone}`,
    margin,
    y,
    9,
    false,
    rgb(0.35, 0.35, 0.35)
  );
  y -= 28;

  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1,
    color: rgb(0.75, 0.65, 0.45),
  });
  y -= 28;

  draw(docLabel(doc.type), margin, y, 18, true);
  y -= 18;
  draw(doc.title, margin, y, 12, true);
  y -= 14;
  draw(`Documento: ${doc.id}`, margin, y, 9, false, rgb(0.4, 0.4, 0.4));
  y -= 12;
  draw(
    `Data emissione: ${new Date(doc.createdAt).toLocaleDateString("it-IT")}`,
    margin,
    y,
    9,
    false,
    rgb(0.4, 0.4, 0.4)
  );
  y -= 12;
  draw(`Stato: ${doc.status.toUpperCase()}`, margin, y, 9, true);
  y -= 28;

  // Cliente
  draw("CLIENTE", margin, y, 11, true, rgb(0.55, 0.4, 0.22));
  y -= 16;
  draw(lead.name, margin, y, 11, true);
  y -= 14;
  draw(`Account: ${lead.accountCode}`, margin, y, 10);
  y -= 12;
  draw(`Tel: ${lead.phone}`, margin, y, 10);
  y -= 12;
  draw(`Email: ${lead.email}`, margin, y, 10);
  if (lead.details?.city) {
    y -= 12;
    draw(`Cantiere: ${lead.details.city}`, margin, y, 10);
  }
  if (lead.details?.workType) {
    y -= 12;
    draw(`Lavoro: ${lead.details.workType}`, margin, y, 10);
  }
  y -= 28;

  // Table header
  page.drawRectangle({
    x: margin,
    y: y - 6,
    width,
    height: 20,
    color: rgb(0.15, 0.15, 0.15),
  });
  draw("Descrizione", margin + 8, y, 10, true, rgb(1, 1, 1));
  draw("Importo", margin + width - 90, y, 10, true, rgb(1, 1, 1));
  y -= 28;

  for (const item of doc.items) {
    if (y < 160) break;
    draw(item.label.slice(0, 70), margin + 4, y, 10);
    draw(euro(item.amount), margin + width - 100, y, 10);
    y -= 8;
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + width, y },
      thickness: 0.4,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 16;
  }

  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1.2,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;
  draw("TOTALE", margin, y, 12, true);
  draw(euro(doc.amount), margin + width - 110, y, 12, true, rgb(0.55, 0.4, 0.22));
  y -= 28;

  if (doc.notes) {
    draw("Note", margin, y, 10, true);
    y -= 14;
    const noteLines = doc.notes.match(/.{1,85}/g) || [doc.notes];
    for (const line of noteLines.slice(0, 4)) {
      draw(line, margin, y, 9, false, rgb(0.35, 0.35, 0.35));
      y -= 12;
    }
    y -= 10;
  }

  // Signature box
  page.drawRectangle({
    x: margin,
    y: 48,
    width,
    height: 90,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  draw("FIRMA DIGITALE CLIENTE", margin + 12, 120, 10, true);
  const signedBy = opts?.signedBy || doc.clientSignature;
  const signedAt = opts?.signedAt || doc.signedAt;

  if (signedBy) {
    draw(`Firmato da: ${signedBy}`, margin + 12, 100, 11, true, rgb(0.1, 0.45, 0.2));
    if (signedAt) {
      draw(
        `Data/ora: ${new Date(signedAt).toLocaleString("it-IT")}`,
        margin + 12,
        84,
        9,
        false,
        rgb(0.3, 0.3, 0.3)
      );
    }
    draw(
      "Documento accettato e firmato online tramite Area Cliente Prestige Edilizia.",
      margin + 12,
      66,
      8,
      false,
      rgb(0.4, 0.4, 0.4)
    );
  } else {
    draw(
      "In attesa di firma del cliente sull'Area Cliente del sito.",
      margin + 12,
      96,
      10,
      false,
      rgb(0.45, 0.45, 0.45)
    );
    draw(
      "Spazio riservato alla firma digitale online.",
      margin + 12,
      78,
      9,
      false,
      rgb(0.55, 0.55, 0.55)
    );
  }

  return pdf.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  // Copy into a plain ArrayBuffer-backed Uint8Array for Blob compatibility
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDocumentPdf(doc: Document, lead: Lead) {
  const bytes = await buildDocumentPdf(doc, lead, {
    signedBy: doc.clientSignature,
    signedAt: doc.signedAt,
  });
  const safe = doc.title.replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 40);
  downloadPdfBytes(bytes, `${doc.type}-${lead.accountCode}-${safe}.pdf`);
}
