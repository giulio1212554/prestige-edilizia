import { NextRequest, NextResponse } from "next/server";
import { getLeadByCode, listDocs } from "@/lib/store";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Codice richiesto" }, { status: 400 });
  }
  const lead = getLeadByCode(code);
  if (!lead) {
    return NextResponse.json({ error: "Account non trovato" }, { status: 404 });
  }
  const docs = listDocs(lead.id);
  return NextResponse.json({
    account: {
      code: lead.accountCode,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      details: lead.details,
      createdAt: lead.createdAt,
    },
    docs,
  });
}
