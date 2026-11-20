import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { company } from "@/data/company";
import type { Document, Lead, PaymentMilestone } from "@/lib/client-db";

const bronze = rgb(0.55, 0.4, 0.22);
const charcoal = rgb(0.12, 0.12, 0.12);
const muted = rgb(0.38, 0.38, 0.38);
const light = rgb(0.96, 0.95, 0.93);
const line = rgb(0.82, 0.78, 0.72);

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

function defaultPayments(total: number): PaymentMilestone[] {
  const a = Math.round(total * 0.3 * 100) / 100;
  const s = Math.round(total * 0.4 * 100) / 100;
  const rest = Math.round((total - a - s) * 100) / 100;
  return [
    { label: "Acconto alla firma del contratto", percent: 30, amount: a },
    { label: "SAL a completamento impianti e grezzo", percent: 40, amount: s },
    { label: "Saldo a consegna lavori e collaudo", percent: 30, amount: rest },
  ];
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export async function buildDocumentPdf(
  doc: Document,
  lead: Lead,
  opts?: { signedBy?: string; signedAt?: string; signatureImage?: string }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 42;
  const pageW = page.getWidth();
  const pageH = page.getHeight();
  const contentW = pageW - margin * 2;
  let y = pageH - 36;

  const draw = (
    text: string,
    x: number,
    yy: number,
    size = 9,
    bold = false,
    color = charcoal
  ) => {
    page.drawText(text, {
      x,
      y: yy,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  const vatExcluded = doc.vatExcluded !== false;
  const vatRate = doc.vatRate ?? 10;
  const subtotal = doc.amount;
  const vatAmount = vatExcluded
    ? Math.round(subtotal * (vatRate / 100) * 100) / 100
    : 0;
  const payments =
    doc.paymentSchedule && doc.paymentSchedule.length > 0
      ? doc.paymentSchedule
      : defaultPayments(subtotal);

  page.drawRectangle({
    x: 0,
    y: pageH - 8,
    width: pageW,
    height: 8,
    color: bronze,
  });

  draw(company.legalName, margin, y, 15, true, bronze);
  y -= 14;
  draw(company.address.full, margin, y, 8, false, muted);
  y -= 11;
  draw(
    `P.IVA ${company.vat}  |  Tel. ${company.phone}`,
    margin,
    y,
    8,
    false,
    muted
  );
  y -= 11;
  draw(`${company.email}  |  ${company.zone}`, margin, y, 8, false, muted);

  const badgeW = 130;
  page.drawRectangle({
    x: pageW - margin - badgeW,
    y: pageH - 72,
    width: badgeW,
    height: 36,
    color: charcoal,
  });
  draw(docLabel(doc.type), pageW - margin - badgeW + 12, pageH - 52, 12, true, rgb(1, 1, 1));
  draw(
    new Date(doc.createdAt).toLocaleDateString("it-IT"),
    pageW - margin - badgeW + 12,
    pageH - 66,
    8,
    false,
    rgb(0.85, 0.85, 0.85)
  );

  y = pageH - 100;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageW - margin, y },
    thickness: 1.2,
    color: bronze,
  });
  y -= 22;

  draw(doc.title, margin, y, 13, true);
  y -= 14;
  draw(`Rif. documento: ${doc.id}`, margin, y, 8, false, muted);
  y -= 11;
  draw(`Stato: ${doc.status.toUpperCase()}`, margin, y, 8, true, muted);
  y -= 20;

  page.drawRectangle({
    x: margin,
    y: y - 68,
    width: contentW,
    height: 78,
    color: light,
  });
  draw("CLIENTE", margin + 12, y - 6, 8, true, bronze);
  draw(lead.name, margin + 12, y - 22, 11, true);
  draw(
    `Account ${lead.accountCode}  |  ${lead.phone}  |  ${lead.email}`,
    margin + 12,
    y - 36,
    8,
    false,
    muted
  );
  const siteBits = [
    lead.details?.city ? `Cantiere: ${lead.details.city}` : "",
    lead.details?.workType ? `Tipologia: ${lead.details.workType}` : "",
    lead.details?.sqm ? `Superficie: ${lead.details.sqm} mq` : "",
  ]
    .filter(Boolean)
    .join("  |  ");
  if (siteBits) draw(siteBits, margin + 12, y - 50, 8, false, muted);
  y -= 90;

  const colAmt = pageW - margin - 88;
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentW,
    height: 18,
    color: charcoal,
  });
  draw("N.", margin + 6, y, 8, true, rgb(1, 1, 1));
  draw("Descrizione lavorazione", margin + 28, y, 8, true, rgb(1, 1, 1));
  draw("Importo", colAmt, y, 8, true, rgb(1, 1, 1));
  y -= 22;

  let idx = 1;
  for (const item of doc.items) {
    if (y < 220) break;
    const lines = wrapText(item.label, 72);
    draw(String(idx).padStart(2, "0"), margin + 6, y, 8, false, muted);
    lines.forEach((ln, i) => {
      draw(ln, margin + 28, y - i * 11, 8, i === 0);
    });
    draw(euro(item.amount), colAmt, y, 8, true);
    y -= Math.max(16, lines.length * 11 + 6);
    page.drawLine({
      start: { x: margin, y: y + 4 },
      end: { x: pageW - margin, y: y + 4 },
      thickness: 0.4,
      color: line,
    });
    y -= 4;
    idx++;
  }

  y -= 8;
  const boxH = 72;
  page.drawRectangle({
    x: margin + contentW * 0.45,
    y: y - boxH,
    width: contentW * 0.55,
    height: boxH,
    color: light,
    borderColor: line,
    borderWidth: 0.8,
  });
  const tx = margin + contentW * 0.45 + 12;
  draw("Imponibile (IVA esclusa)", tx, y - 16, 8, false, muted);
  draw(euro(subtotal), pageW - margin - 90, y - 16, 9, true);
  draw(
    `IVA ${vatRate}% ${vatExcluded ? "(da applicare in fattura)" : "inclusa"}`,
    tx,
    y - 32,
    8,
    false,
    muted
  );
  draw(
    vatExcluded ? euro(vatAmount) : "-",
    pageW - margin - 90,
    y - 32,
    8,
    false,
    muted
  );
  page.drawLine({
    start: { x: tx, y: y - 40 },
    end: { x: pageW - margin - 12, y: y - 40 },
    thickness: 0.6,
    color: bronze,
  });
  draw("TOTALE DOCUMENTO", tx, y - 56, 9, true);
  draw(euro(subtotal), pageW - margin - 90, y - 56, 11, true, bronze);
  y -= boxH + 16;

  page.drawRectangle({
    x: margin,
    y: y - 36,
    width: contentW,
    height: 40,
    borderColor: bronze,
    borderWidth: 1,
  });
  draw("REGIME IVA", margin + 10, y - 12, 8, true, bronze);
  const ivaText = vatExcluded
    ? `Importi indicati IVA ESCLUSA. Aliquota applicabile: ${vatRate}% (tipica per interventi di recupero edilizio / ristrutturazione residenziale, salvo diversa disposizione normativa). L'IVA sara esposta in fattura al momento della fatturazione.`
    : `Importi IVA inclusa al ${vatRate}%.`;
  wrapText(ivaText, 95)
    .slice(0, 2)
    .forEach((ln, i) => {
      draw(ln, margin + 10, y - 24 - i * 10, 7, false, muted);
    });
  y -= 52;

  draw("PIANO DI PAGAMENTO", margin, y, 9, true, bronze);
  y -= 14;
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentW,
    height: 16,
    color: charcoal,
  });
  draw("Scadenza / fase", margin + 8, y, 7, true, rgb(1, 1, 1));
  draw("%", margin + contentW * 0.62, y, 7, true, rgb(1, 1, 1));
  draw("Importo", margin + contentW * 0.72, y, 7, true, rgb(1, 1, 1));
  y -= 18;

  for (const p of payments) {
    if (y < 130) break;
    draw(p.label.slice(0, 55), margin + 8, y, 8);
    draw(`${p.percent}%`, margin + contentW * 0.62, y, 8, true);
    draw(euro(p.amount), margin + contentW * 0.72, y, 8, true);
    y -= 6;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageW - margin, y },
      thickness: 0.35,
      color: line,
    });
    y -= 12;
  }
  y -= 6;

  if (doc.notes) {
    draw("Note e condizioni", margin, y, 8, true, bronze);
    y -= 12;
    for (const ln of wrapText(doc.notes, 100).slice(0, 3)) {
      draw(ln, margin, y, 7, false, muted);
      y -= 10;
    }
    y -= 4;
  }

  const sigY = 48;
  page.drawRectangle({
    x: margin,
    y: sigY,
    width: contentW,
    height: 88,
    borderColor: line,
    borderWidth: 1,
  });
  draw("FIRMA DIGITALE CLIENTE", margin + 12, sigY + 72, 8, true, bronze);

  const signedBy = opts?.signedBy || doc.clientSignature;
  const signedAt = opts?.signedAt || doc.signedAt;
  const sigImg = opts?.signatureImage || doc.signatureImage;

  if (signedBy) {
    draw(
      `Firmato da: ${signedBy}`,
      margin + 12,
      sigY + 56,
      9,
      true,
      rgb(0.1, 0.42, 0.22)
    );
    if (signedAt) {
      draw(
        `Data e ora: ${new Date(signedAt).toLocaleString("it-IT")}`,
        margin + 12,
        sigY + 42,
        7,
        false,
        muted
      );
    }
    draw(
      "Documento accettato e firmato online tramite Area Cliente Prestige Edilizia.",
      margin + 12,
      sigY + 28,
      7,
      false,
      muted
    );
    if (sigImg && sigImg.startsWith("data:image")) {
      try {
        const base64 = sigImg.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const png = await pdf.embedPng(bytes);
        const maxW = 160;
        const maxH = 44;
        const scale = Math.min(maxW / png.width, maxH / png.height);
        page.drawImage(png, {
          x: pageW - margin - png.width * scale - 14,
          y: sigY + 10,
          width: png.width * scale,
          height: png.height * scale,
        });
      } catch {
        /* ignore */
      }
    }
  } else {
    draw(
      "In attesa di firma del cliente sull'Area Cliente del sito.",
      margin + 12,
      sigY + 52,
      8,
      false,
      muted
    );
    draw(
      "Il cliente puo firmare con dito o mouse; la firma grafica verra registrata e inclusa nel PDF.",
      margin + 12,
      sigY + 38,
      7,
      false,
      muted
    );
  }

  draw(
    `${company.legalName}  -  ${company.certifications.join(" - ")}  -  Documento generato digitalmente`,
    margin,
    28,
    6.5,
    false,
    muted
  );

  return pdf.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
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
    signatureImage: doc.signatureImage,
  });
  const safe = doc.title.replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 40);
  downloadPdfBytes(bytes, `${doc.type}-${lead.accountCode}-${safe}.pdf`);
}
