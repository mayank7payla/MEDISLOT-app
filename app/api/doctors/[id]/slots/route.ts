import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDateStr, slotsForDoctor } from "@/lib/slots";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = new URL(req.url).searchParams.get("date");
  if (!isDateStr(date)) return NextResponse.json({ error: "date=YYYY-MM-DD required" }, { status: 400 });
  const slots = await slotsForDoctor(prisma, id, date);
  if (!slots) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  return NextResponse.json(slots);
}
