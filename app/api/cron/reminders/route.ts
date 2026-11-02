import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fmt, sendMail } from "@/lib/mail";

// Runs hourly (see vercel.json). Emails patients whose appointment is within the next 24 hours.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const due = await prisma.appointment.findMany({
    where: { status: "BOOKED", reminderSent: false, startsAt: { gt: now, lte: new Date(now.getTime() + 24 * 3600 * 1000) } },
    include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
  });
  for (const a of due) {
    await sendMail(a.patient.user.email, "Appointment reminder",
      `Hi ${a.patient.user.name},\n\nReminder: you have an appointment with Dr. ${a.doctor.user.name} on ${fmt(a.startsAt)}.\n\n- MediSlot`);
    await prisma.appointment.update({ where: { id: a.id }, data: { reminderSent: true } });
  }
  return NextResponse.json({ sent: due.length });
}
