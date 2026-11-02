// Slot generation + conflict detection helpers (clinic time zone via CLINIC_TZ_OFFSET)
const TZ = process.env.CLINIC_TZ_OFFSET ?? "+05:30";

export const toDate = (date: string, hm: string) => new Date(`${date}T${hm}:00${TZ}`);
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00${TZ}`).getUTCDay();
export const isDateStr = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export type Slot = { startsAt: string; available: boolean };

export function buildSlots(
  date: string,
  windows: { startTime: string; endTime: string }[],
  stepMinutes: number,
  booked: Date[]
): Slot[] {
  const taken = new Set(booked.map((d) => d.getTime()));
  const now = Date.now();
  const out: Slot[] = [];
  for (const w of windows) {
    let t = toDate(date, w.startTime).getTime();
    const end = toDate(date, w.endTime).getTime();
    while (t + stepMinutes * 60000 <= end) {
      out.push({ startsAt: new Date(t).toISOString(), available: t > now && !taken.has(t) });
      t += stepMinutes * 60000;
    }
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function slotsForDoctor(prisma: any, doctorId: string, date: string) {
  const doc = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { availability: { where: { weekday: weekdayOf(date) } } },
  });
  if (!doc) return null;
  const dayStart = toDate(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const booked = await prisma.appointment.findMany({
    where: { doctorId, status: "BOOKED", startsAt: { gte: dayStart, lt: dayEnd } },
    select: { startsAt: true },
  });
  return buildSlots(date, doc.availability, doc.slotMinutes, booked.map((b: any) => b.startsAt));
}
