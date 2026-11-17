export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  features: string[];
  icon: string;
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "chiavi-in-mano",
    title: "Ristrutturazioni Chiavi in Mano",
    shortTitle: "Chiavi in mano",
    description: "Gestiamo l'intero intervento: dalla progettazione al collaudo. Un unico referente, zero stress.",
    longDescription: "Il servizio chiavi in mano di Prestige Edilizia gestisce pratiche, progettazione, cantiere e consegna.",
    features: ["Unico interlocutore", "Pratiche e bonus", "Tempi certi", "Garanzia post-consegna"],
    icon: "Key",
    seoTitle: "Ristrutturazioni Chiavi in Mano Milano | Prestige Edilizia",
    seoDescription: "Ristrutturazione chiavi in mano a Milano. Richiedi un sopralluogo gratuito.",
  },
  {
    slug: "ristrutturazioni",
    title: "Ristrutturazioni Residenziali di Pregio",
    shortTitle: "Ristrutturazioni",
    description: "Interventi di restyling e ristrutturazione completa per appartamenti e ville di alto livello.",
    longDescription: "Specializzati in ristrutturazioni di pregio su immobili storici e contemporanei.",
    features: ["Restauro e restyling", "Materiali pregiati", "Efficientamento energetico"],
    icon: "Home",
    seoTitle: "Ristrutturazioni di Pregio Milano | Prestige Edilizia",
    seoDescription: "Ristrutturazioni residenziali di lusso a Milano.",
  },
  {
    slug: "nuove-costruzioni",
    title: "Nuove Costruzioni Residenziali",
    shortTitle: "Nuove costruzioni",
    description: "Ville e residences di nuova costruzione con standard costruttivi elevati.",
    longDescription: "Realizziamo nuove costruzioni residenziali di fascia alta.",
    features: ["Progettazione completa", "Classe energetica A4", "Chiavi in mano"],
    icon: "Building2",
    seoTitle: "Nuove Costruzioni Residenziali Milano | Prestige Edilizia",
    seoDescription: "Ville e nuove costruzioni di lusso a Milano.",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
