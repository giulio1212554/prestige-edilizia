import { NextRequest, NextResponse } from "next/server";
import { addDoc, listDocs, updateLead } from "@/lib/store";

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
  const leadId = req.nextUrl.searchParams.get("leadId") || undefined;
  return NextResponse.json({ docs: listDocs(leadId) });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const leadId = String(body.leadId || "");
    const type = body.type === "fattura" || body.type === "contratto" ? body.type : "preventivo";
    const title = String(body.title || "Preventivo");
    const items = Array.isArray(body.items) ? body.items : [];
    const amount =
      Number(body.amount) ||
      items.reduce((s: number, it: { amount?: number }) => s + Number(it.amount || 0), 0);
    const notes = String(body.notes || "");
    const send = Boolean(body.send);

    if (!leadId) {
      return NextResponse.json({ error: "leadId richiesto" }, { status: 400 });
    }

    const doc = addDoc({
      leadId,
      type,
      title,
      amount,
      items,
      notes,
      status: send ? "inviato" : "bozza",
    });

    if (send) {
      updateLead(leadId, { status: "preventivo_inviato", read: true });
    }

    return NextResponse.json({ doc }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 400 });
  }
}
