import { NextRequest, NextResponse } from "next/server";
import { addLead, listLeads, unreadCount } from "@/lib/store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2025";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  return NextResponse.json({
    leads: listLeads(),
    unread: unreadCount(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const type =
      body.type === "preventivo" || body.type === "altro"
        ? body.type
        : "sopralluogo";
    const details = body.details && typeof body.details === "object" ? body.details : undefined;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Compila i campi obbligatori" },
        { status: 400 }
      );
    }

    const lead = addLead({
      name,
      email: email || `${phone.replace(/\D/g, "")}@cliente.local`,
      phone,
      message,
      type,
      details,
    });

    return NextResponse.json(
      { ok: true, id: lead.id, accountCode: lead.accountCode },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
}
