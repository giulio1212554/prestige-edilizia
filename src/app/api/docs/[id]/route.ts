import { NextRequest, NextResponse } from "next/server";
import { getDoc, updateDoc, updateLead } from "@/lib/store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2025";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === ADMIN_PASSWORD;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Client signature (public, with matching name check light)
    if (body.action === "sign") {
      const signature = String(body.signature || "").trim();
      if (!signature) {
        return NextResponse.json({ error: "Firma richiesta" }, { status: 400 });
      }
      const doc = updateDoc(id, {
        status: "firmato",
        clientSignature: signature,
        signedAt: new Date().toISOString(),
      });
      if (!doc) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
      updateLead(doc.leadId, { status: "accettato" });
      return NextResponse.json({ doc });
    }

    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const existing = getDoc(id);
    if (!existing) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

    const doc = updateDoc(id, {
      status: body.status,
      title: body.title,
      notes: body.notes,
      amount: body.amount,
      items: body.items,
    });

    if (body.status === "inviato") {
      updateLead(existing.leadId, { status: "preventivo_inviato" });
    }

    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 400 });
  }
}
