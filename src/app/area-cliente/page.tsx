"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Doc = {
  id: string;
  type: string;
  title: string;
  amount: number;
  items: { label: string; amount: number }[];
  notes: string;
  status: string;
  signedAt?: string;
  clientSignature?: string;
};

type Account = {
  code: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  details?: Record<string, unknown>;
};

function ClientInner() {
  const search = useSearchParams();
  const [code, setCode] = useState(search.get("code") || "");
  const [account, setAccount] = useState<Account | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signName, setSignName] = useState("");
  const [signingId, setSigningId] = useState<string | null>(null);

  const load = async (c: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/client?code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setAccount(data.account);
      setDocs(data.docs || []);
    } catch (e) {
      setAccount(null);
      setDocs([]);
      setError(e instanceof Error ? e.message : "Account non trovato");
    } finally {
      setLoading(false);
    }
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
    if (!signName.trim()) return;
    setSigningId(docId);
    try {
      const res = await fetch(`/api/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", signature: signName.trim() }),
      });
      if (!res.ok) throw new Error("Firma non riuscita");
      await load(code);
      setSignName("");
    } catch {
      setError("Impossibile firmare il documento");
    } finally {
      setSigningId(null);
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
        <p className="mt-2 text-warmgray-600 text-sm">
          Inserisci il codice account ricevuto dopo la richiesta di preventivo.
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

        {loading && <p className="mt-6 text-sm text-warmgray-500">Caricamento…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {account && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-white border border-warmgray-200 p-6">
              <p className="text-xs uppercase tracking-wider text-warmgray-400">
                Account {account.code}
              </p>
              <p className="mt-1 font-serif text-xl font-semibold">{account.name}</p>
              <p className="text-sm text-warmgray-600">
                {account.phone} · {account.email}
              </p>
              <p className="mt-2 inline-block rounded-full bg-bronze/10 text-bronze text-xs font-semibold px-2.5 py-1">
                Stato: {account.status.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-3">
                Documenti
              </h2>
              {docs.length === 0 ? (
                <p className="text-sm text-warmgray-500 rounded-xl border border-dashed border-warmgray-300 p-6 text-center">
                  Nessun preventivo ancora. Ti avviseremo quando sarà pronto.
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
                          <h3 className="font-semibold text-charcoal">{d.title}</h3>
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
                              € {it.amount.toLocaleString("it-IT")}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-warmgray-100 pt-3 font-semibold">
                        <span>Totale</span>
                        <span className="text-bronze">
                          € {d.amount.toLocaleString("it-IT")}
                        </span>
                      </div>
                      {d.notes && (
                        <p className="mt-2 text-xs text-warmgray-500">{d.notes}</p>
                      )}

                      {d.status === "firmato" && (
                        <p className="mt-4 text-sm text-green-700">
                          Firmato da <strong>{d.clientSignature}</strong>
                          {d.signedAt &&
                            ` · ${new Date(d.signedAt).toLocaleString("it-IT")}`}
                        </p>
                      )}

                      {d.status === "inviato" && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <input
                            value={signName}
                            onChange={(e) => setSignName(e.target.value)}
                            placeholder="Digita nome e cognome per firmare"
                            className="flex-1 rounded-lg border border-warmgray-200 px-3 py-2 text-sm focus:border-bronze focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={!signName.trim() || signingId === d.id}
                            onClick={() => sign(d.id)}
                            className="rounded-lg bg-bronze px-4 py-2 text-sm font-semibold text-white hover:bg-bronze-600 disabled:opacity-50"
                          >
                            {signingId === d.id ? "..." : "Firma online"}
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
