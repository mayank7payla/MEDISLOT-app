import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { fmt } from "@/lib/mail";
import CancelButton from "@/components/CancelButton";
import PrescriptionForm from "@/components/PrescriptionForm";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const where = u.role === "ADMIN" ? {} : u.role === "DOCTOR" ? { doctor: { userId: u.id } } : { patient: { userId: u.id } };
  const appts = await prisma.appointment.findMany({
    where, orderBy: { startsAt: "desc" },
    include: { doctor: { include: { user: true, department: true } }, patient: { include: { user: true } }, prescription: true },
  });
  const upcoming = appts.filter((a) => a.status === "BOOKED");
  const past = appts.filter((a) => a.status !== "BOOKED");

  const Row = (a: (typeof appts)[number]) => (
    <div className="card" key={a.id}>
      <b>{fmt(a.startsAt)}</b> <span className="tag">{a.status}</span>
      <p>{u.role === "PATIENT" ? `Dr. ${a.doctor.user.name} - ${a.doctor.department.name}` : `Patient: ${a.patient.user.name}`}</p>
      {a.reason && <p className="muted">Reason: {a.reason}</p>}
      {a.prescription && <p>Diagnosis: {a.prescription.diagnosis} &middot; <a href={`/api/prescriptions/${a.id}/pdf`}>Download prescription (PDF)</a></p>}
      {a.status === "BOOKED" && <CancelButton id={a.id} />}{" "}
      {u.role === "DOCTOR" && a.status !== "CANCELLED" && <PrescriptionForm appointmentId={a.id} />}
    </div>
  );

  return (
    <>
      <h1>Hello, {u.name}</h1>
      <h2>Upcoming</h2>
      {upcoming.length ? upcoming.map(Row) : <p className="muted">Nothing booked.</p>}
      <h2>{u.role === "PATIENT" ? "Health history & past visits" : "Past visits"}</h2>
      {past.length ? past.map(Row) : <p className="muted">No past visits yet.</p>}
    </>
  );
}
