export type BeforeAfterItem = {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

/**
 * Prima = ambienti malandati / sporchi / abbandonati
 * Dopo = ristrutturazioni nuove, luminose, di pregio
 */
export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "bagno",
    title: "Rifacimento bagno",
    description:
      "Da bagno fatiscente e insalubre a suite moderna con finiture di pregio.",
    before:
      "https://images.unsplash.com/photo-1659116599300-7271e585ae76?w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1756079664354-34944e001f6d?w=1200&q=80",
  },
  {
    id: "pavimenti",
    title: "Posa pavimenti",
    description:
      "Sostituzione di pavimenti rotti e detriti con parquet e finiture nuove.",
    before:
      "https://images.unsplash.com/photo-1444419988131-046ed4e5ffd6?w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
  },
  {
    id: "cucina",
    title: "Rifacimento cucina",
    description:
      "Cucina abbandonata e polverosa trasformata in spazio nuovo e funzionale.",
    before:
      "https://images.unsplash.com/photo-1755336522640-d821da5826f1?w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80",
  },
  {
    id: "pareti",
    title: "Tinteggiatura e risanamento pareti",
    description:
      "Pareti scrostate e umide risanate con superfici uniformi e luminose.",
    before:
      "https://images.unsplash.com/photo-1761251947312-25f3a214821f?w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
  },
];
