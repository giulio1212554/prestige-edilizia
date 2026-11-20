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
    const updated = updateDoc(docId, {
      status: "firmato",
      clientSignature: signName.trim(),
      signatureImage: signatureData,
      signedAt: new Date().toISOString(),
    });
    updateLead(account.id, { status: "accettato" });
    load(account.accountCode);
    if (updated) {
      try {
        setPdfBusy(docId);
        await downloadDocumentPdf(updated, {
          ...account,
          status: "accettato",
        });
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
          \u2190 Torna al sito
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-charcoal">
          Area cliente
        </h1>
        <p className="mt-2 text-warmgray-600 text-sm">
          Inserisci il codice account. Puoi scaricare i PDF e firmare online con
          firma grafica (dito o mouse).
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
            className="rounded-lg bg-charcoal px-5 py-3 text-sm font-semibold text-white hover:bg-charcoal-800"
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
              <p className="mt-1 font-serif text-xl font-semibold">
                {account.name}
              </p>
              <p className="text-sm text-warmgray-600">
                {account.phone} \u00b7 {account.email}
              </p>
              <p className="mt-2 inline-block rounded-full bg-bronze/10 text-bronze text-xs font-semibold px-2.5 py-1">
                Stato: {account.status.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-3">
                Documenti PDF
              </h2>
              {docs.length === 0 ? (
                <p className="text-sm text-warmgray-500 rounded-xl border border-dashed border-warmgray-300 p-6 text-center">
                  Nessun preventivo ancora. Quando l'admin lo invia, lo vedi
                  qui e puoi scaricare il PDF.
                </p>
              ) : (
                <div className="space-y-4">
                  {docs.map((d) => (
                    <article
                      key={d.id}
                      className="rounded-xl bg-white border border-warmgray-200 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase text-warmgray-400">
                            {d.type}
                          </p>
                          <h3 className="font-semibold text-charcoal">
                            {d.title}
                          </h3>
                        </div>
                        <span
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                            d.status === "firmato"
                              ? "bg-green-100 text-green-800"
                              : d.status === "inviato"
                                ? "bg-bronze/15 text-bronze"
                                : "bg-warmgray-100 text-warmgray-600"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-sm">
                        {d.items.map((it, i) => (
                          <li key={i} className="flex justify-between gap-4">
                            <span className="text-warmgray-600">{it.label}</span>
                            <span className="font-medium">
                              \u20ac {it.amount.toLocaleString("it-IT")}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-warmgray-100 pt-3 font-semibold">
                        <span>Totale</span>
                        <span className="text-bronze">
                          \u20ac {d.amount.toLocaleString("it-IT")}
                        </span>
                      </div>
                      {d.notes && (
                        <p className="mt-2 text-xs text-warmgray-500">
                          {d.notes}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={pdfBusy === d.id}
                          onClick={() => downloadPdf(d)}
                          className="rounded-lg border border-charcoal px-4 py-2 text-sm font-semibold hover:bg-charcoal hover:text-white disabled:opacity-50"
                        >
                          {pdfBusy === d.id ? "Genero PDF..." : "Scarica PDF"}
                        </button>
                      </div>

                      {d.status === "firmato" && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-100 p-3">
                          <p className="text-sm text-green-800">
                            Firmato da <strong>{d.clientSignature}</strong>
                            {d.signedAt &&
                              ` \u00b7 ${new Date(d.signedAt).toLocaleString("it-IT")}`}
                          </p>
                          {d.signatureImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.signatureImage}
                              alt="Firma"
                              className="mt-2 h-16 object-contain bg-white rounded border border-green-100"
                            />
                          )}
                        </div>
                      )}

                      {d.status === "inviato" && (
                        <div className="mt-4 space-y-3 rounded-xl border border-bronze/30 bg-bronze/5 p-4">
                          <p className="text-sm font-medium text-charcoal">
                            Firma il documento
                          </p>
                          <input
                            value={signName}
                            onChange={(e) => setSignName(e.target.value)}
                            placeholder="Nome e cognome (per esteso)"
                            className="w-full rounded-lg border border-warmgray-200 px-3 py-2 text-sm focus:border-bronze focus:outline-none bg-white"
                          />
                          <SignaturePad onChange={setSignatureData} />
                          <button
                            type="button"
                            disabled={
                              !signName.trim() ||
                              !signatureData ||
                              signingId === d.id
                            }
                            onClick={() => sign(d.id)}
                            className="w-full rounded-lg bg-bronze px-4 py-3 text-sm font-semibold text-white hover:bg-bronze-600 disabled:opacity-50"
                          >
                            {signingId === d.id
                              ? "Firma in corso..."
                              : "Conferma firma e scarica PDF"}
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
          Caricamento\u2026
        </div>
      }
    >
      <ClientInner />
    </Suspense>
  );
}
