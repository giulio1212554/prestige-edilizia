import type { Metadata } from "next";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Informativa sulla privacy di ${company.name}`,
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 md:pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">Privacy Policy</h1>
        <p className="text-warmgray-600 mt-2">Ultimo aggiornamento: novembre 2025</p>
        <div className="mt-10 space-y-6 text-charcoal-700 leading-relaxed">
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">1. Titolare del trattamento</h2>
            <p>Il Titolare è {company.legalName}, con sede in {company.address.full}, P.IVA {company.vat}, email: {company.email}.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">2. Dati raccolti</h2>
            <p>Raccogliamo i dati che ci fornisci tramite i form di contatto (nome, email, telefono, messaggio) e, previo consenso, dati di navigazione.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">3. Finalità</h2>
            <p>Rispondere alle richieste di informazioni e sopralluogo, adempiere a obblighi di legge, e con consenso inviare comunicazioni commerciali.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">4. Diritti</h2>
            <p>Puoi esercitare i diritti di accesso, rettifica, cancellazione e opposizione scrivendo a {company.email}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
