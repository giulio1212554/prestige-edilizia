export type Testimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marco e Giulia R.",
    role: "Appartamento a Brera",
    text: "Abbiamo affidato a Prestige Edilizia la ristrutturazione completa del nostro appartamento. Professionalità, rispetto dei tempi e un risultato che ha superato le aspettative. Consigliatissimi.",
    rating: 5,
  },
  {
    id: "2",
    name: "Alessandro B.",
    role: "Villa in Brianza",
    text: "Dal sopralluogo alla consegna tutto è stato gestito con grande cura. Il team ha saputo ascoltare le nostre esigenze e proporre soluzioni intelligenti. Un partner di fiducia.",
    rating: 5,
  },
  {
    id: "3",
    name: "Studio Legale Conti",
    role: "Uffici Porta Nuova",
    text: "Ristrutturazione degli uffici completata nei tempi previsti e con ottima qualità. Comunicazione costante e attenzione al dettaglio. Torneremo a collaborare.",
    rating: 5,
  },
  {
    id: "4",
    name: "Francesca M.",
    role: "Loft ai Navigli",
    text: "Trasformare un ex magazzino in casa è stato un sogno. Prestige ha reso tutto semplice e ha valorizzato al massimo gli spazi. Grazie di cuore.",
    rating: 5,
  },
];

export const partners = [
  { name: "Knauf", logo: "/partners/knauf.svg" },
  { name: "Schüco", logo: "/partners/schuco.svg" },
  { name: "Porcelanosa", logo: "/partners/porcelanosa.svg" },
  { name: "BTicino", logo: "/partners/bticino.svg" },
  { name: "Viessmann", logo: "/partners/viessmann.svg" },
  { name: "Ideal Standard", logo: "/partners/ideal-standard.svg" },
];
