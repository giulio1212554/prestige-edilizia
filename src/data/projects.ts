export type ProjectCategory = "appartamenti" | "ville" | "nuove-costruzioni" | "commerciali";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  location: string;
  year: number;
  sqm: number;
  durationMonths: number;
  description: string;
  longDescription: string;
  features: string[];
  coverImage: string;
  gallery: string[];
  beforeAfter?: { before: string; after: string };
};

export const projects: Project[] = [
  {
    slug: "appartamento-brera",
    title: "Appartamento di prestigio a Brera",
    category: "appartamenti",
    location: "Milano, Brera",
    year: 2024,
    sqm: 180,
    durationMonths: 9,
    description: "Ristrutturazione completa di un appartamento storico nel cuore di Brera.",
    longDescription: "Intervento di ristrutturazione integrale su un appartamento di 180 mq in un edificio d'epoca nel quartiere Brera.",
    features: ["Open space living + cucina", "Restauro stucchi e parquet", "Domotica integrata"],
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
  },
  {
    slug: "villa-lago-como",
    title: "Villa contemporanea sul Lago di Como",
    category: "ville",
    location: "Tremezzina (CO)",
    year: 2023,
    sqm: 420,
    durationMonths: 18,
    description: "Nuova costruzione di una villa a tre livelli con vista lago.",
    longDescription: "Progettazione e realizzazione di una villa unifamiliare di 420 mq con vista panoramica sul Lago di Como.",
    features: ["Vista lago e piscina", "Classe energetica A4", "Domotica e geotermia"],
    coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    ],
  },
];

export const categoryLabels: Record<ProjectCategory, string> = {
  appartamenti: "Appartamenti",
  ville: "Ville",
  "nuove-costruzioni": "Nuove costruzioni",
  commerciali: "Commerciali",
};

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
