export type BeforeAfterItem = {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "bagno",
    title: "Rifacimento bagno",
    description: "Rinnovo completo del bagno con nuovi rivestimenti, sanitari e finiture.",
    before:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80",
  },
  {
    id: "pavimenti",
    title: "Posa pavimenti",
    description: "Sostituzione del vecchio pavimento con una nuova posa curata nei dettagli.",
    before:
      "https://images.unsplash.com/photo-1560185007-cde3f4b73a61?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80",
  },
  {
    id: "cucina",
    title: "Rivestimento cucina con piastrelle",
    description: "Nuovo rivestimento in piastrelle per una cucina più pulita e moderna.",
    before:
      "https://images.unsplash.com/photo-1556911220-bff31c812dce?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=900&q=80",
  },
  {
    id: "pareti",
    title: "Tinteggiatura pareti",
    description: "Preparazione delle superfici e tinteggiatura per pareti uniformi e luminose.",
    before:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
    after:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80",
  },
];
