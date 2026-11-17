"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal text-white p-4 shadow-2xl border-t border-charcoal-700">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-warmgray-200 leading-relaxed max-w-2xl">
          Utilizziamo cookie tecnici e, previo consenso, cookie analitici per migliorare
          l&apos;esperienza. Continuando la navigazione o cliccando &quot;Accetta&quot;
          acconsenti all&apos;uso.{" "}
          <Link href="/cookie" className="underline hover:text-bronze">
            Maggiori informazioni
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm border border-warmgray-600 rounded-sm hover:bg-charcoal-800 transition"
          >
            Rifiuta
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-bronze text-white rounded-sm hover:bg-bronze-600 transition font-medium"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
