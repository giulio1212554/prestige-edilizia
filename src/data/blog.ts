export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "quanto-costa-ristrutturare-casa-2025",
    title: "Quanto costa ristrutturare casa a Milano nel 2025?",
    excerpt:
      "Una guida aggiornata sui costi medi al mq per ristrutturazioni complete e parziali, con focus su finiture di pregio e bonus disponibili.",
    category: "Costi",
    date: "2025-03-12",
    readTime: "8 min",
    coverImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    content: [
      "Il costo di una ristrutturazione a Milano varia in modo sensibile in base allo stato dell'immobile, al livello di finiture e alla complessità degli impianti. Nel 2025 i prezzi medi di mercato per una ristrutturazione completa (demolizioni, impianti, massetti, pavimenti, bagni e finiture) si attestano tra gli 800 e i 2.500 euro al metro quadro.",
      "Per un appartamento standard con finiture di buona qualità si parla spesso di 1.100–1.600 euro al mq. Se si punta a materiali di pregio, falegnameria su misura, domotica e bagni con soluzioni spa, il range sale facilmente sopra i 1.800–2.200 euro al mq.",
      "Oltre al costo al mq vanno considerati: pratiche edilizie e oneri, eventuale direzione lavori, imprevisti (in genere conviene prevedere un 10–15% di margine) e l'IVA. I bonus fiscali, quando applicabili, possono ridurre in modo importante l'esborso netto.",
      "Un preventivo affidabile nasce solo dopo un sopralluogo: stato delle strutture, impianti esistenti, vincoli condominiali e scelte di progetto cambiano i numeri. Per questo in Prestige Edilizia proponiamo sempre un sopralluogo gratuito e un quadro costi trasparente prima di qualsiasi impegno.",
      "Se stai valutando una ristrutturazione a Milano o provincia, usa il nostro calcolatore indicativo e poi richiedi un contatto: ti aiutiamo a capire costi, tempi e possibili detrazioni senza impegno.",
    ],
  },
  {
    slug: "bonus-ristrutturazioni-guida",
    title: "Bonus Ristrutturazioni: guida pratica 2025",
    excerpt:
      "Tutto quello che c'è da sapere su detrazioni, sconto in fattura e cessione del credito per i lavori di ristrutturazione.",
    category: "Bonus",
    date: "2025-02-28",
    readTime: "6 min",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    content: [
      "I bonus edilizi restano uno strumento importante per chi ristruttura. Nel 2025 le regole e le aliquote possono cambiare rispetto agli anni precedenti: conviene sempre verificare le disposizioni aggiornate e farsi assistere da un professionista per pratiche e asseverazioni.",
      "In linea generale, le detrazioni sulle ristrutturazioni riguardano interventi di manutenzione straordinaria, restauro e ristrutturazione edilizia. L'importo detraibile e le modalità (detrazione in dichiarazione, sconto in fattura o cessione del credito, dove ancora previste) dipendono dalla normativa vigente al momento dei lavori e dei pagamenti.",
      "Per non perdere il diritto alla detrazione è essenziale: pagare con bonifico parlante, conservare fatture e ricevute, rispettare i massimali e le condizioni di legge, e affidare le eventuali asseverazioni a tecnici abilitati.",
      "Prestige Edilizia affianca i clienti nella valutazione di fattibilità dei bonus, nel coordinamento con CAF e professionisti e nella documentazione di cantiere. Non sostituiamo il consulente fiscale, ma rendiamo il percorso più chiaro e ordinato dal primo preventivo alla consegna.",
      "Hai un intervento in programma? Contattaci per un'analisi preliminare: ti indichiamo cosa è realistico aspettarsi in termini di costi e agevolazioni, in base al tipo di lavori e all'immobile.",
    ],
  },
  {
    slug: "tempi-ristrutturazione-appartamento",
    title: "Quanto tempo serve per ristrutturare un appartamento?",
    excerpt:
      "Fasi, tempistiche realistiche e fattori che influenzano la durata di un cantiere di ristrutturazione residenziale.",
    category: "Tempi",
    date: "2025-01-15",
    readTime: "5 min",
    coverImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
    content: [
      "I tempi di una ristrutturazione non dipendono solo dai metri quadri. Contano lo stato di partenza, le pratiche edilizie, la disponibilità di materiali e il livello di personalizzazione delle finiture. Per un appartamento medio a Milano, una ristrutturazione completa dura spesso tra i 4 e i 9 mesi di cantiere, a cui vanno aggiunte le fasi di progetto e autorizzazioni.",
      "In sintesi tipica: sopralluogo e concept (1–3 settimane), progetto e pratiche (da poche settimane a qualche mese in base ai vincoli), cantiere (demolizioni, impianti, massetti, pavimenti, finiture), collaudo e consegna. I bagni e la cucina sono spesso i punti più lunghi e delicati.",
      "Ritardi frequenti nascono da: decisioni di progetto in corso d'opera, forniture personalizzate con lead time lunghi, imprevisti strutturali o impiantistici, vincoli condominiali o di cantiere in centro città. Un programma lavori chiaro e aggiornamenti settimanali riducono le sorprese.",
      "In Prestige Edilizia fissiamo fasi e scadenze già in preventivo, con un responsabile di cantiere dedicato. L'obiettivo non è solo finire in tempo, ma consegnare uno spazio all'altezza delle aspettative senza stress inutili per il cliente.",
      "Vuoi una stima dei tempi per il tuo immobile? Richiedi un sopralluogo: dopo aver visto lo stato di fatto e le tue priorità, ti proponiamo un cronoprogramma realistico.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
