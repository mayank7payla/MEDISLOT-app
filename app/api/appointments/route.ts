import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { slotsForDoctor, toDate } from "@/lib/slots";
import { fmt, sendMail } from "@/lib/mail";

const schema = z.object({
  doctorId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().max(300).optional(),
});

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const where =
    u.role === "ADMIN" ? {} : u.role === "DOCTOR" ? { doctor: { userId: u.id } } : { patient: { userId: u.id } };
  const items = await prisma.appointment.findMany({
    where, orderBy: { startsAt: "desc" },
    include: { doctor: { include: { user: true, department: true } }, patient: { include: { user: true } }, prescription: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "PATIENT") return NextResponse.json({ error: "Login as a patient to book" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
  const { doctorId, date, time, reason } = parsed.data;

  // 1) the requested time must be a real, still-free slot in the doctor's calendar
  const startsAt = toDate(date, time);
  const slots = await slotsForDoctor(prisma, doctorId, date);
  const slot = slots?.find((s) => s.startsAt === startsAt.toISOString());
  if (!slot || !slot.available) return NextResponse.json({ error: "Slot not available" }, { status: 409 });

  const patient = await prisma.patient.findUnique({ where: { userId: u.id } });
  if (!patient) return NextResponse.json({ error: "Patient profile missing" }, { status: 400 });

  // 2) create; the unique(doctorId, startsAt) constraint catches simultaneous bookings (race conditions)
  try {
    const old = await prisma.appointment.findUnique({ where: { doctorId_startsAt: { doctorId, startsAt } } });
    const appt = old && old.status === "CANCELLED"
      ? await prisma.appointment.update({ where: { id: old.id }, data: { status: "BOOKED", patientId: patient.id, reason, reminderSent: false } })
      : await prisma.appointment.create({ data: { doctorId, patientId: patient.id, startsAt, reason } });
    const doc = await prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: true } });
    await sendMail(u.email, "Appointment confirmed",
      `Hi ${u.name},\n\nYour appointment with Dr. ${doc?.user.name} is confirmed for ${fmt(startsAt)}.\n\n- MediSlot`);
    return NextResponse.json(appt, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Someone just booked this slot" }, { status: 409 });
    throw e;
  }
}
