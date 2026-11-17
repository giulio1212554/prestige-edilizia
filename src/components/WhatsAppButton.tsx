"use client";

import { MessageCircle } from "lucide-react";
import { company } from "@/data/company";

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Buongiorno, vorrei richiedere informazioni su un sopralluogo."
  );
  const href = `https://wa.me/${company.whatsapp}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "click_whatsapp", {
            event_category: "contatto",
          });
        }
      }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      aria-label="Contattaci su WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
