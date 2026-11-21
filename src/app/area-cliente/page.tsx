"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  authClient,
  getLeadByCode,
  listDocs,
  updateDoc,
  type Lead,
  type Document,
} from "@/lib/client-db";
import { downloadDocumentPdf } from "@/lib/pdf";
import SignaturePad from "@/components/SignaturePad";
import { buildAcceptance } from "@/lib/acceptance";
import { toFiscalView } from "@/lib/fiscal-store";
import { FileText, Home, CheckCircle2, Clock, LogOut, Lock } from "lucide-react";

const SESSION_KEY = "pe-client-session";

function ClientInner() {
  const search = useSearchParams();
  const [code, setCode] = useState(search.get("code") || "");
  const [pin, setPin] = useState("");
  const [account, setAccount] = useState<Lead | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [signName, setSignName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"firmare" | "storico" | "cantiere">("firmare");

  const refreshDocs = (lead: Lead) => setDocs(listDocs(lead.id));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const { code: c } = JSON.parse(raw) as { code: string };
        const lead = getLeadByCode(c);
        if (lead) {
          setAccount(lead);
          setCode(lead.accountCode);
          refreshDocs(lead);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const login = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const lead = authClient(code.trim(), pin.trim());
    if (!lead) {
      setAccount(null);
      setDocs([]);
      setError("Codice o password non corretti. Esempio: PE-1002 / monza");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code: lead.accountCode }));
    setAccount(lead);
    refreshDocs(lead);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAccount(null);
    setDocs([]);
    setPin("");
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
    updateDoc(docId, {
      status: "firmato",
      clientSignature: signName.trim(),
      signatureImage: signatureData,
      signedAt: acceptance.consentedAt,
      lifecycle: "accettato",
      acceptance,
      auditLog: [audit],
    } as Partial<Document>);
    refreshDocs(account);
    setSigningId(null);
    setSignatureData(null);
    setSignName("");
    setTab("storico");
  };

  const toSign = docs.filter((d) => d.status === "inviato");
  const history = docs.filter((d) => d.status !== "inviato");
  const siteLabel =
    account?.details?.workType ||
    account?.details?.city ||
    account?.message?.slice(0, 80) ||
    "Il tuo intervento";

  if (!account) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f7f5f2]">
        <div className="w-full max-w-md rounded-2xl border border-warmgray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-bronze/15 text-bronze flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-warmgray-900">Area cliente</h1>
              <p className="text-sm text-warmgray-500">Codice account + password</p>
            </div>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-warmgray-600">Codice cliente</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Es. PE-1002"
                className="mt-1 w-full rounded-xl border border-warmgray-200 px-4 py-3 text-sm"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-warmgray-600">Password</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Password ricevuta"
                className="mt-1 w-full rounded-xl border border-warmgray-200 px-4 py-3 text-sm"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-bronze px-4 py-3 text-sm font-semibold text-white">
              Entra
            </button>
          </form>
          <div className="mt-6 rounded-xl bg-warmgray-50 border border-warmgray-100 p-4 text-xs text-warmgray-600 space-y-1">
            <p className="font-semibold text-warmgray-800">Demo rapida</p>
            <p>
              Codice <span className="font-mono">PE-1002</span> · password{" "}
              <span className="font-mono">monza</span>
            </p>
            <p>
              Codice <span className="font-mono">PE-1001</span> · password{" "}
              <span className="font-mono">navigli</span>
            </p>
          </div>
          <p className="mt-4 text-center text-sm text-warmgray-400">
            <Link href="/" className="text-bronze hover:underline">
              Torna al sito
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="border-b border-warmgray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-warmgray-400">Area cliente</p>
            <p className="font-serif text-xl font-semibold">{account.name}</p>
            <p className="text-sm text-warmgray-500">
              {account.accountCode} · {account.email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-warmgray-600"
          >
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <div className="rounded-2xl border border-warmgray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-warmgray-400 uppercase">Il tuo cantiere</p>
              <p className="font-semibold text-warmgray-900">{siteLabel}</p>
              <p className="text-sm text-warmgray-500 mt-0.5">
                {[account.details?.city, account.details?.sqm && `${account.details.sqm} mq`, account.details?.budget]
                  .filter(Boolean)
                  .join(" · ") || account.message.slice(0, 120)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(
            [
              { id: "firmare" as const, label: "Da firmare", n: toSign.length },
              { id: "storico" as const, label: "Storico", n: history.length },
              { id: "cantiere" as const, label: "Cantiere e approvazioni", n: 0 },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                tab === t.id ? "bg-bronze text-white" : "bg-white border text-warmgray-600"
              }`}
            >
              {t.label}
              {t.n > 0 && <span className="ml-1.5 text-[10px] opacity-90">({t.n})</span>}
            </button>
          ))}
        </div>

        {tab === "firmare" && (
          <div className="space-y-4">
            {toSign.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-warmgray-500">
                Nessun documento in attesa di firma.
              </div>
            ) : (
              toSign.map((d) => (
                <article key={d.id} className="rounded-2xl border border-warmgray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-amber-600 font-semibold">Da firmare</p>
                      <h2 className="font-semibold text-lg">{d.title}</h2>
                      <p className="text-sm text-warmgray-500">
                        {d.type} · EUR {d.amount.toLocaleString("it-IT")}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-warmgray-300" />
                  </div>
                  {d.items?.length > 0 && (
                    <ul className="mt-3 text-sm text-warmgray-600 space-y-1">
                      {d.items.slice(0, 4).map((it) => (
                        <li key={it.label} className="flex justify-between gap-2">
                          <span className="truncate">{it.label}</span>
                          <span className="shrink-0">EUR {it.amount.toLocaleString("it-IT")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 space-y-3 rounded-xl border border-bronze/30 bg-bronze/5 p-4">
                    <p className="text-sm font-medium">Firma e accetta</p>
                    <input
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      placeholder="Nome e cognome per esteso"
                      className="w-full rounded-lg border px-3 py-2 text-sm bg-white"
                    />
                    <SignaturePad onChange={setSignatureData} />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!signName.trim() || !signatureData || signingId === d.id}
                        onClick={() => sign(d.id)}
                        className="rounded-lg bg-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {signingId === d.id ? "Registrazione..." : "Registra accettazione"}
                      </button>
                      <button
                        type="button"
                        disabled={pdfBusy === d.id}
                        onClick={async () => {
                          setPdfBusy(d.id);
                          try {
                            await downloadDocumentPdf(d, account);
                          } finally {
                            setPdfBusy(null);
                          }
                        }}
                        className="rounded-lg border px-4 py-3 text-sm font-semibold"
                      >
                        Anteprima PDF
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "storico" && (
          <div className="space-y-3">
            {history.length === 0 && docs.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-warmgray-500">
                Nessun documento nello storico.
              </div>
            ) : null}
            {(history.length ? history : docs.filter((d) => d.status === "firmato" || d.status === "bozza")).map(
              (d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-warmgray-500">
                      {d.type} · {d.status}
                      {d.signedAt && ` · firmato ${new Date(d.signedAt).toLocaleDateString("it-IT")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.status === "firmato" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Firmato
                      </span>
                    )}
                    <button
                      type="button"
                      className="text-sm font-semibold text-bronze"
                      onClick={async () => {
                        setPdfBusy(d.id);
                        try {
                          await downloadDocumentPdf(d, account);
                        } finally {
                          setPdfBusy(null);
                        }
                      }}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {tab === "cantiere" && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
              <h2 className="font-semibold">Dettaglio intervento</h2>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-warmgray-400 text-xs">Citta</dt>
                  <dd>{account.details?.city || "—"}</dd>
                </div>
                <div>
                  <dt className="text-warmgray-400 text-xs">Tipo lavori</dt>
                  <dd>{account.details?.workType || "—"}</dd>
                </div>
                <div>
                  <dt className="text-warmgray-400 text-xs">Superficie</dt>
                  <dd>{account.details?.sqm || "—"}</dd>
                </div>
                <div>
                  <dt className="text-warmgray-400 text-xs">Budget indicativo</dt>
                  <dd>{account.details?.budget || "—"}</dd>
                </div>
              </dl>
              <p className="text-sm text-warmgray-600 border-t pt-3">{account.message}</p>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-warmgray-400" />
                Approvazioni e pagamenti
              </h2>
              {docs.some((d) => d.paymentSchedule?.length) ? (
                <ul className="space-y-2">
                  {docs.flatMap((d) =>
                    (d.paymentSchedule || []).map((p, i) => (
                      <li
                        key={d.id + i}
                        className="flex justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm"
                      >
                        <span>
                          {p.label}
                          <span className="block text-[11px] text-warmgray-400">{d.title}</span>
                        </span>
                        <span className="font-semibold shrink-0">
                          EUR {p.amount.toLocaleString("it-IT")}
                          <span className="block text-[11px] font-normal text-warmgray-400">
                            {p.paid ? "Pagato" : "In attesa"}
                          </span>
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              ) : (
                <p className="text-sm text-warmgray-500">
                  Le rate e le approvazioni compariranno quando ricevi un preventivo o un contratto.
                </p>
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
        <div className="min-h-screen flex items-center justify-center text-warmgray-500">Caricamento…</div>
      }
    >
      <ClientInner />
    </Suspense>
  );
}
