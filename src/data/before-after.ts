import { RB, RA, CB, CA } from "./ba-images";

export type BeforeAfterItem = {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

/** Stesso ambiente e stesso punto di vista in ogni coppia */
export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "bagno",
    title: "Ristrutturazione ambiente",
    description:
      "Stesso ambiente e stesso punto di vista: da malandato a completamente rinnovato.",
    before: RB,
    after: RA,
  },
  {
    id: "pavimenti",
    title: "Posa pavimenti e risanamento",
    description:
      "Stessa stanza, stesse finestre: pavimento distrutto vs parquet nuovo.",
    before: RB,
    after: RA,
  },
  {
    id: "cucina",
    title: "Rifacimento cucina",
    description:
      "Stessa cucina e stessa finestra di fondo: da abbandonata a nuova.",
    before: CB,
    after: CA,
  },
  {
    id: "pareti",
    title: "Tinteggiatura e risanamento pareti",
    description:
      "Stesso punto di vista: intonaco scrostato vs pareti bianche.",
    before: RB,
    after: RA,
  },
];
