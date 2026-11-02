import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

// Cancel an appointment (owner patient, their doctor, or admin)
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const a = await prisma.appointment.findUnique({ where: { id }, include: { doctor: true, patient: true } });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const allowed = u.role === "ADMIN" || a.patient.userId === u.id || a.doctor.userId === u.id;
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
