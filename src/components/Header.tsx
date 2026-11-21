"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { company } from "@/data/company";

const links = [
  { href: "/#servizi", label: "Servizi" },
  { href: "/#portfolio", label: "Progetti" },
  { href: "/#processo", label: "Processo" },
  { href: "/#chi-siamo", label: "Chi siamo" },
  { href: "/calcolatore", label: "Calcolatore" },
  { href: "/#contatti", label: "Contatti" },
  { href: "/area-cliente", label: "Area cliente" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-warmgray-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bronze text-sm font-bold text-white">
            PE
          </span>
          <span className="font-serif text-lg font-semibold text-warmgray-900">{company.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-warmgray-600 transition hover:text-bronze"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`tel:${company.phoneRaw}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-warmgray-200 px-3 py-1.5 text-sm font-medium text-warmgray-700"
          >
            <Phone className="h-3.5 w-3.5" />
            {company.phone}
          </a>
          <Link
            href="/#contatti"
            className="rounded-full bg-bronze px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Preventivo
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-warmgray-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-warmgray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-warmgray-700"
              >
                {link.label}
              </Link>
            ))}
            <a href={`tel:${company.phoneRaw}`} className="text-sm font-medium text-warmgray-700">
              Chiama {company.phone}
            </a>
            <Link
              href="/#contatti"
              onClick={() => setOpen(false)}
              className="rounded-full bg-bronze px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Preventivo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
