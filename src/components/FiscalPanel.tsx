"use client";

import { useMemo, useState } from "react";
import { listDocs, updateDoc, getLead, type Document } from "@/lib/client-db";
import { fiscalDashboard, toFiscalView } from "@/lib/fiscal-store";
import { FISCAL_MODE, docKindLabel, lifecycleLabel } from "@/lib/fiscal";
import {
  buildFatturaPaXml,
  downloadTextFile,
  nextInvoiceNumber,
} from "@/lib/fatturapa";
import { downloadDocumentPdf } from "@/lib/pdf";

const columns: {
  key: keyof ReturnType<typeof fiscalDashboard>;
  title: string;
  hint: string;
}[] = [
  {
    key: "inPreparazione",
    title: "In preparazione",
    hint: "Bozze e documenti non ancora inviati",
  },
  {
    key: "firmatiAccettati",
    title: "Accettati / firmati",
    hint: "Consenso cliente registrato",
  },
  {
    key: "fattureTrasmesse",
    title: "Fatture trasmesse",
    hint: "Richiede provider SdI collegato",
  },
  {
    key: "fattureConsegnate",
    title: "Fatture consegnate",
    hint: "Notifiche SdI (provider)",
  },
  {
    key: "fattureScartate",
    title: "Fatture scartate",
    hint: "Da correggere e ritrasmettere",
  },
  {
    key: "pagamentiRicevuti",
    title: "Pagamenti ricevuti",
    hint: "Ricevute e saldi pagati",
  },
  {
    key: "pagamentiDaRicevere",
    title: "Pagamenti da ricevere",
    hint: "Rate/SAL non pagati",
  },
];

export default function FiscalPanel({ onRefresh }: { onRefresh?: () => void }) {
  const [tick, setTick] = useState(0);
  const dash = useMemo(() => fiscalDashboard(), [tick]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = () => {
    setTick((t) => t + 1);
    onRefresh?.();
  };

  const genXml = (d: Document) => {
    if (d.type !== "fattura" && d.type !== "fattura_elettronica") {
      setMsg("XML FatturaPA disponibile solo per fatture elettroniche.");
      return;
    }
    const lead = getLead(d.leadId);
    const fiscal = toFiscalView(d, lead);
    const numbers = listDocs()
      .map((x) => (x as { number?: string }).number)
      .filter(Boolean) as string[];
    if (!fiscal.number) {
      const n = nextInvoiceNumber(numbers);
      updateDoc(d.id, {
        number: n,
        type: "fattura_elettronica",
        sdi: {
          providerConnected: false,
          progressiveNumber: n,
          transmissionStatus: "non_trasmessa_demo",
          sdiNotifications: [],
          xmlGeneratedAt: new Date().toISOString(),
        },
      } as Parameters<typeof updateDoc>[1]);
      fiscal.number = n;
    }
    const { xml, fileName, disclaimer } = buildFatturaPaXml(fiscal);
    downloadTextFile(xml, fileName);
    setMsg(disclaimer);
    refresh();
  };

  const markReady = (d: Document) => {
    updateDoc(d.id, {
      lifecycle: "pronta_trasmissione",
      type: "fattura_elettronica",
      sdi: {
        providerConnected: false,
        progressiveNumber: (d as { number?: string }).number,
        transmissionStatus: "non_trasmessa_demo",
        sdiNotifications: [
          {
            at: new Date().toISOString(),
            code: "DEMO",
            message:
              "Nessun provider SdI collegato. Trasmissione non eseguita.",
          },
        ],
      },
    } as Parameters<typeof updateDoc>[1]);
    setMsg(
      "Documento segnato come pronto per SdI. Stato DEMO: nessuna trasmissione reale."
    );
    refresh();
  };

  const downloadPdf = async (d: Document) => {
    const lead = getLead(d.leadId);
    if (!lead) return;
    setBusy(d.id);
    try {
      await downloadDocumentPdf(d, lead);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Modalita {FISCAL_MODE}</strong> — Nessuna trasmissione allo SdI,
        nessuna FEA/FEQ qualificata, nessuna conservazione a norma attiva. Il PDF
        delle fatture e solo <em>copia di cortesia</em>; l'XML FatturaPA e
        generabile ma non inviato.
      </div>

      {msg && (
        <p className="rounded-lg bg-bronze/10 text-bronze text-sm px-4 py-2">
          {msg}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {columns.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-warmgray-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wider text-warmgray-400">
              {c.title}
            </p>
            <p className="mt-1 font-serif text-3xl font-semibold text-charcoal">
              {dash[c.key].length}
            </p>
            <p className="text-xs text-warmgray-500 mt-1">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warmgray-50 text-left">
            <tr>
              <th className="p-3">Tipo</th>
              <th className="p-3">N.</th>
              <th className="p-3">Titolo</th>
              <th className="p-3">Stato</th>
              <th className="p-3">SdI</th>
              <th className="p-3">Totale</th>
              <th className="p-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {dash.all.map((d) => (
              <tr key={d.id} className="border-t align-top">
                <td className="p-3">
                  {docKindLabel(
                    ((d as { kind?: string }).kind || d.type) as never
                  )}
                </td>
                <td className="p-3 font-mono text-xs">
                  {(d as { number?: string }).number || "—"}
                </td>
                <td className="p-3">{d.title}</td>
                <td className="p-3">
                  {lifecycleLabel(
                    ((d as { lifecycle?: string }).lifecycle ||
                      (d.status === "firmato"
                        ? "accettato"
                        : d.status === "inviato"
                          ? "inviato_cliente"
                          : "bozza")) as never
                  )}
                </td>
                <td className="p-3 text-xs">
                  {(d as { sdi?: { transmissionStatus?: string } }).sdi
                    ?.transmissionStatus || "non_applicabile"}
                  <span className="block text-amber-700">DEMO</span>
                </td>
                <td className="p-3">
                  EUR{" "}
                  {(
                    (d as { grandTotal?: number }).grandTotal ?? d.amount
                  ).toLocaleString("it-IT")}
                </td>
                <td className="p-3 space-y-1">
                  <button
                    type="button"
                    disabled={busy === d.id}
                    onClick={() => downloadPdf(d)}
                    className="block text-bronze font-semibold"
                  >
                    PDF cortesia
                  </button>
                  {(d.type === "fattura" ||
                    d.type === "fattura_elettronica") && (
                    <>
                      <button
                        type="button"
                        onClick={() => genXml(d)}
                        className="block text-charcoal font-semibold"
                      >
                        XML FatturaPA (DEMO)
                      </button>
                      <button
                        type="button"
                        onClick={() => markReady(d)}
                        className="block text-warmgray-600"
                      >
                        Segna pronto SdI
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
