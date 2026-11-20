"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getLeadByCode,
  listDocs,
  updateDoc,
  updateLead,
  type Lead,
  type Document,
} from "@/lib/client-db";
import { downloadDocumentPdf } from "@/lib/pdf";
import SignaturePad from "@/components/SignaturePad";
import { buildAcceptance } from "@/lib/acceptance";
import { toFiscalView } from "@/lib/fiscal-store";

function ClientInner() {
  const search = useSearchParams();
  const [code, setCode] = useState(search.get("code") || "");
  const [account, setAccount] = useState<Lead | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [signName, setSignName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);

  const load = (c: string) => {
    setError("");
    const lead = getLeadByCode(c);
    if (!lead) {
      setAccount(null);
      setDocs([]);
      setError("Account non trovato. Controlla il codice (es. PE-1001).");
      return;
    }
    setAccount(lead);
    setDocs(listDocs(lead.id));
  };

  useEffect(() => {
    const c = search.get("code");
    if (c) {
      setCode(c);
      load(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) load(code.trim());
  };

  const sign = async (docId: string) => {
    if (!signName.trim() || !signatureData || !account) return;
    setSigningId(docId);
    const current = docs.find((d) => d.id === docId);
    if (!current) {
      setSigningId(null);
      return;
    }
    const fiscal = toFiscalView(current, account);
    const { acceptance, audit } = await buildAcceptance(fiscal, {
      signerName: signName.trim(),
      signerEmail: account.email,
      graphicTraceDataUrl: signatureData || undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
    const updated = updateDoc(docId, {
      status: "firmato",
      clientSignature: signName.trim(),
      signatureImage: signatureData,
      signedAt: acceptance.consentedAt,
      lifecycle: "accettato",
      acceptance,
      auditLog: [audit],
    } as Parameters<typeof updateDoc>[1]);
    updateLead(account.id, { status: "accettato" });
    load(account.accountCode);
    if (updated) {
      try {
        setPdfBusy(docId);
        await downloadDocumentPdf(updated, { ...account, status: "accettato" });
      } catch {
        /* ignore */
      } finally {
        setPdfBusy(null);
      }
    }
    setSignName("");
    setSignatureData(null);
    setSigningId(null);
  };

  const downloadPdf = async (d: Document) => {
    if (!account) return;
    try {
      setPdfBusy(d.id);
      await downloadDocumentPdf(d, account);
    } catch {
      setError("Errore generazione PDF. Riprova.");
    } finally {
      setPdfBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-warmgray-50 pt-28 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-bronze hover:underline">
          ← Torna al sito
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal">
          Area cliente
        </h1>
        <p className="mt-2 inline-block rounded-full bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1">
          Ambiente DEMO — nessuna FEA/FEQ ne trasmissione SdI attive
        </p>
        <p className="mt-2 text-warmgray-600 text-sm">
          Accettazione elettronica semplice tracciata (consenso + hash documento).
          Non costituisce firma elettronica qualificata.
        </p>

        <form onSubmit={onSearch} className="mt-6 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Es. PE-1001"
            className="flex-1 rounded-lg border border-warmgray-200 px-4 py-3 font-mono focus:border-bronze focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-charcoal px-5 py-3 text-sm font-semibold text-white"
          >
            Apri
          </button>
        </form>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {account && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-white border border-warmgray-200 p-6">
              <p className="text-xs uppercase tracking-wider text-warmgray-400">
                Account {account.accountCode}
              </p>
              <p className="mt-1 font-serif text-xl font-semibold">{account.name}</p>
              <p className="text-sm text-warmgray-600">
                {account.phone} · {account.email}
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold mb-3">Documenti</h2>
              {docs.length === 0 ? (
                <p className="text-sm text-warmgray-500 border border-dashed rounded-xl p-6 text-center">
                  Nessun documento ancora.
                </p>
              ) : (
                <div className="space-y-4">
                  {docs.map((d) => (
                    <article
                      key={d.id}
                      className="rounded-xl bg-white border border-warmgray-200 p-5"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase text-warmgray-400">{d.type}</p>
                          <h3 className="font-semibold">{d.title}</h3>
                        </div>
                        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-warmgray-100">
                          {d.status}
                        </span>
                      </div>
                      <div className="mt-3 flex justify-between font-semibold border-t pt-3">
                        <span>Totale imponibile</span>
                        <span className="text-bronze">
                          EUR {d.amount.toLocaleString("it-IT")}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={pdfBusy === d.id}
                        onClick={() => downloadPdf(d)}
                        className="mt-4 rounded-lg border border-charcoal px-4 py-2 text-sm font-semibold"
                      >
                        {pdfBusy === d.id ? "Genero..." : "Scarica PDF cortesia"}
                      </button>

                      {d.status === "firmato" && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-100 p-3 space-y-1">
                          <p className="text-sm text-green-800">
                            Accettato da <strong>{d.clientSignature}</strong>
                            {d.signedAt &&
                              ` · ${new Date(d.signedAt).toLocaleString("it-IT")}`}
                          </p>
                          <p className="text-xs text-green-700">
                            Accettazione semplice tracciata — non FEA/FEQ.
                          </p>
                          {(d as { acceptance?: { documentHash?: string } }).acceptance
                            ?.documentHash && (
                            <p className="text-[10px] font-mono break-all text-green-800/80">
                              Hash:{" "}
                              {
                                (d as { acceptance: { documentHash: string } }).acceptance
                                  .documentHash
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {d.status === "inviato" && (
                        <div className="mt-4 space-y-3 rounded-xl border border-bronze/30 bg-bronze/5 p-4">
                          <p className="text-sm font-medium">Accetta il documento</p>
                          <input
                            value={signName}
                            onChange={(e) => setSignName(e.target.value)}
                            placeholder="Nome e cognome per esteso"
                            className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
                          />
                          <SignaturePad onChange={setSignatureData} />
                          <button
                            type="button"
                            disabled={
                              !signName.trim() || !signatureData || signingId === d.id
                            }
                            onClick={() => sign(d.id)}
                            className="w-full rounded-lg bg-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {signingId === d.id
                              ? "Registrazione..."
                              : "Registra accettazione e scarica PDF"}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AreaClientePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-warmgray-500">
          Caricamento…
        </div>
      }
    >
      <ClientInner />
    </Suspense>
  );
}
