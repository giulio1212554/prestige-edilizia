import type { Metadata } from "next";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Informativa sui cookie di ${company.name}`,
};

export default function CookiePage() {
  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">Cookie Policy</h1>
        <p className="text-warmgray-600 mt-2">Ultimo aggiornamento: novembre 2025</p>
        <div className="mt-10 space-y-6 text-charcoal-700 leading-relaxed">
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">Cosa sono i cookie</h2>
            <p>I cookie sono piccoli file di testo che i siti inviano al dispositivo dell&apos;utente.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">Cookie utilizzati</h2>
            <p><strong>Cookie tecnici</strong>: necessari al funzionamento del sito. <strong>Cookie analitici</strong>: usati previo consenso per statistiche aggregate.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">Gestione del consenso</h2>
            <p>Al primo accesso viene mostrato un banner. Puoi modificare le preferenze cancellando i cookie dal browser.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">Contatti</h2>
            <p>Per domande: {company.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
