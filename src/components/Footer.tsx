import Link from "next/link";
import { company } from "@/data/company";
import { services } from "@/data/services";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-warmgray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white">{company.name}</h3>
            <p className="text-sm leading-relaxed text-warmgray-300">
              {company.description}
            </p>
            <p className="text-xs text-warmgray-400">
              {company.legalName} · P.IVA {company.vat}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Servizi
            </h4>
            <ul className="space-y-2">
              {services.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/servizi/${s.slug}`}
                    className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                  >
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Azienda
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#chi-siamo"
                  className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                >
                  Chi siamo
                </Link>
              </li>
              <li>
                <Link
                  href="/#portfolio"
                  className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                >
                  Progetti
                </Link>
              </li>
              <li>
                <Link
                  href="/calcolatore"
                  className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                >
                  Calcolatore costi
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie"
                  className="text-sm text-warmgray-300 hover:text-bronze transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contatti
            </h4>
            <ul className="space-y-3 text-sm text-warmgray-300">
              <li>{company.address.full}</li>
              <li>
                <a
                  href={`tel:${company.phoneRaw}`}
                  className="hover:text-bronze transition-colors"
                >
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="hover:text-bronze transition-colors"
                >
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-warmgray-500">
            © {currentYear} {company.legalName}. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-warmgray-500">
            Sito realizzato con cura · Next.js + Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
