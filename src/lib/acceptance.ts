/**
 * Accettazione tracciata del documento (NON firma elettronica qualificata).
 * Registra identita dichiarata, consenso, timestamp, hash documento e audit.
 * Per FEA/FEQ serve integrazione con un prestatore di servizi fiduciari qualificato.
 */

import type { AcceptanceRecord, AuditEntry, FiscalDocument } from "./fiscal";
import { documentFingerprint, sha256Hex } from "./fiscal";

export type AcceptInput = {
  signerName: string;
  signerEmail?: string;
  graphicTraceDataUrl?: string;
  userAgent?: string;
};

export async function buildAcceptance(
  doc: FiscalDocument,
  input: AcceptInput
): Promise<{ acceptance: AcceptanceRecord; audit: AuditEntry }> {
  const payload = documentFingerprint(doc);
  const documentHash = await sha256Hex(payload);
  const consentedAt = new Date().toISOString();

  const acceptance: AcceptanceRecord = {
    kind: "accettazione_semplice_tracciata",
    signerName: input.signerName.trim(),
    signerEmail: input.signerEmail,
    consentedAt,
    documentId: doc.id,
    documentNumber: doc.number,
    documentHash,
    userAgent: input.userAgent,
    graphicTraceDataUrl: input.graphicTraceDataUrl,
    notes:
      "Accettazione elettronica semplice tracciata. Non costituisce firma elettronica avanzata o qualificata ai sensi del eIDAS / CAD.",
  };

  const audit: AuditEntry = {
    id: `aud-${Date.now()}`,
    at: consentedAt,
    action: "accettazione_registrata",
    detail: `Hash SHA-256: ${documentHash.slice(0, 16)}… — firmatario dichiarato: ${acceptance.signerName}`,
    actor: acceptance.signerName,
  };

  return { acceptance, audit };
}
