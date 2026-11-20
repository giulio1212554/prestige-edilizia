import { roomBefore } from "./img-room-before";
import { roomAfter } from "./img-room-after";

export type BeforeAfterItem = {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

/** Stesso ambiente e stesso punto di vista */
export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "ambiente",
    title: "Ristrutturazione ambiente",
    description:
      "Stesso ambiente e stesso punto di vista: da malandato a completamente rinnovato.",
    before: roomBefore,
    after: roomAfter,
  },
  {
    id: "pavimenti",
    title: "Posa pavimenti e risanamento",
    description:
      "Stessa stanza, stesse finestre: pavimento distrutto vs parquet nuovo.",
    before: roomBefore,
    after: roomAfter,
  },
  {
    id: "cucina",
    title: "Rifacimento cucina",
    description:
      "Cucina abbandonata trasformata in spazio nuovo e funzionale.",
    before:
      "https://images.unsplash.com/photo-1556911220-bff31c28b2b0?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=900&q=80",
  },
  {
    id: "bagno",
    title: "Rifacimento bagno",
    description:
      "Da bagno fatiscente a suite moderna con finiture di pregio.",
    before:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80",
  },
];
