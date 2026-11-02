import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { fmt } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const u = await currentUser();
  if (!u || u.role !== "ADMIN") notFound();
  const [patients, doctors, byStatus, recent] = await Promise.all([
    prisma.patient.count(), prisma.doctor.count(),
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    prisma.appointment.findMany({ take: 15, orderBy: { createdAt: "desc" },
      include: { doctor: { include: { user: true, department: true } }, patient: { include: { user: true } } } }),
  ]);
  return (
    <>
      <h1>Admin panel</h1>
      <div className="grid">
        <div className="card"><b>{patients}</b><br />Patients</div>
        <div className="card"><b>{doctors}</b><br />Doctors</div>
        {byStatus.map((s) => <div className="card" key={s.status}><b>{s._count}</b><br />{s.status}</div>)}
      </div>
      <h2>Recent bookings</h2>
      {recent.map((a) => (
        <div className="card" key={a.id}>{fmt(a.startsAt)} &middot; {a.patient.user.name} &rarr; Dr. {a.doctor.user.name} ({a.doctor.department.name}) <span className="tag">{a.status}</span></div>
      ))}
    </>
  );
}
