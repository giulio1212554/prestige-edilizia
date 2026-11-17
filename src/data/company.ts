export const company = {
  name: "Prestige Edilizia",
  legalName: "Prestige Edilizia S.r.l.",
  tagline: "Eccellenza costruttiva. Residenziale di pregio.",
  description:
    "Impresa edile di fascia alta specializzata in ristrutturazioni chiavi in mano e nuove costruzioni residenziali di lusso a Milano e provincia. Solidità, precisione e cura del dettaglio dal 2004.",
  zone: "Milano e provincia",
  specialization: "Residenziale di pregio e ristrutturazioni di lusso",
  phone: "+39 02 1234 5678",
  phoneRaw: "390212345678",
  whatsapp: "393331234567",
  email: "info@prestige-edilizia.it",
  address: {
    street: "Via della Solidità 12",
    city: "Milano",
    zip: "20121",
    region: "Lombardia",
    country: "Italia",
    full: "Via della Solidità 12, 20121 Milano (MI)",
  },
  vat: "IT12345678901",
  years: 20,
  projectsCompleted: 340,
  sqmBuilt: 85000,
  clientsSatisfied: 298,
  certifications: ["SOA OS6", "ISO 9001", "ISO 45001"],
  social: {
    instagram: "https://instagram.com/prestigeedilizia",
    linkedin: "https://linkedin.com/company/prestige-edilizia",
  },
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.3!2d9.185!3d45.465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDI3JzU0LjAiTiA5wrAxMScwNi4wIkU!5e0!3m2!1sit!2sit!4v1700000000000",
};

export type Company = typeof company;
