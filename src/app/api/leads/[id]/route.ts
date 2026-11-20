import { NextRequest, NextResponse } from "next/server";
import { updateLead } from "@/lib/store";

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
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const lead = updateLead(id, {
      status: body.status,
      read: body.read,
    });
    if (!lead) {
      return NextResponse.json({ error: "Non trovato" }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 400 });
  }
}
