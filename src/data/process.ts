export type ProcessStep = {
  number: number;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Sopralluogo",
    description:
      "Visita gratuita sul posto per comprendere esigenze, vincoli e potenzialità dell'immobile. Ascolto e analisi preliminare.",
  },
  {
    number: 2,
    title: "Preventivo",
    description:
      "Elaborazione di un preventivo dettagliato e trasparente, con opzioni e indicazioni sui possibili bonus fiscali.",
  },
  {
    number: 3,
    title: "Progetto",
    description:
      "Progettazione architettonica ed esecutiva, pratiche edilizie e coordinamento con i professionisti necessari.",
  },
  {
    number: 4,
    title: "Cantiere",
    description:
      "Apertura cantiere, esecuzione dei lavori con controllo qualità continuo e aggiornamenti settimanali al cliente.",
  },
  {
    number: 5,
    title: "Consegna",
    description:
      "Collaudo, consegna chiavi in mano e assistenza post-vendita. Il tuo nuovo spazio è pronto per essere vissuto.",
  },
];
