export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
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
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
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
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
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
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
];
