import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

const schema = z.object({
  appointmentId: z.string(),
  diagnosis: z.string().min(2),
  medicines: z.array(z.object({ name: z.string(), dose: z.string(), days: z.string() })).min(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "DOCTOR") return NextResponse.json({ error: "Doctors only" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid prescription" }, { status: 400 });
  const d = parsed.data;
  const appt = await prisma.appointment.findUnique({ where: { id: d.appointmentId }, include: { doctor: true } });
  if (!appt || appt.doctor.userId !== u.id) return NextResponse.json({ error: "Not your appointment" }, { status: 403 });
  const data = { diagnosis: d.diagnosis, medicines: d.medicines, notes: d.notes };
  const rx = await prisma.prescription.upsert({
    where: { appointmentId: d.appointmentId }, update: data, create: { appointmentId: d.appointmentId, ...data },
  });
  await prisma.appointment.update({ where: { id: d.appointmentId }, data: { status: "COMPLETED" } });
  return NextResponse.json(rx, { status: 201 });
}
