"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { company } from "@/data/company";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#servizi", label: "Servizi" },
  { href: "/#portfolio", label: "Progetti" },
  { href: "/#processo", label: "Processo" },
  { href: "/#chi-siamo", label: "Chi siamo" },
  { href: "/calcolatore", label: "Calcolatore" },
  { href: "/#contatti", label: "Contatti" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-warmgray-100"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={cn(
                "font-serif text-xl md:text-2xl font-semibold tracking-tight transition-colors",
                scrolled ? "text-charcoal" : "text-white"
              )}
            >
              {company.name}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-bronze",
                  scrolled ? "text-charcoal-700" : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${company.phoneRaw}`}
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).gtag) {
                  (window as any).gtag("event", "click_telefono", {
                    event_category: "contatto",
                  });
                }
              }}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                scrolled ? "text-charcoal-700 hover:text-bronze" : "text-white/90 hover:text-white"
              )}
            >
              <Phone className="h-4 w-4" />
              {company.phone}
            </a>
            <Link
              href="/#contatti"
              className="inline-flex items-center justify-center rounded-sm bg-bronze px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-bronze-600"
            >
              Richiedi sopralluogo
            </Link>
          </div>

          <button
            type="button"
            className={cn(
              "lg:hidden p-2 rounded-md transition-colors",
              scrolled ? "text-charcoal" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-warmgray-100 overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-charcoal-800 hover:text-bronze py-2"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`tel:${company.phoneRaw}`}
                className="flex items-center gap-2 text-charcoal-700 py-2"
              >
                <Phone className="h-4 w-4" />
                {company.phone}
              </a>
              <Link
                href="/#contatti"
                onClick={() => setIsOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-sm bg-bronze px-5 py-3 text-sm font-semibold text-white"
              >
                Richiedi sopralluogo
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
