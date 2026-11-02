import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { fmt } from "@/lib/mail";

export async function GET(_: Request, { params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const u = await currentUser();
  if (!u) return new Response("Login required", { status: 401 });
  const a = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { prescription: true, doctor: { include: { user: true, department: true } }, patient: { include: { user: true } } },
  });
  if (!a?.prescription) return new Response("No prescription", { status: 404 });
  const allowed = u.role === "ADMIN" || a.patient.userId === u.id || a.doctor.userId === u.id;
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((r) => doc.on("end", () => r(Buffer.concat(chunks))));

  doc.fontSize(22).text("MediSlot Hospital", { align: "center" });
  doc.fontSize(11).text("Prescription", { align: "center" }).moveDown(1.5);
  doc.fontSize(12).text(`Patient: ${a.patient.user.name}`);
  doc.text(`Doctor: Dr. ${a.doctor.user.name} (${a.doctor.department.name})`);
  doc.text(`Visit: ${fmt(a.startsAt)}`).moveDown();
  doc.fontSize(13).text("Diagnosis", { underline: true }).fontSize(12).text(a.prescription.diagnosis).moveDown();
  doc.fontSize(13).text("Medicines", { underline: true }).fontSize(12);
  (a.prescription.medicines as { name: string; dose: string; days: string }[]).forEach((m, i) =>
    doc.text(`${i + 1}. ${m.name} - ${m.dose} for ${m.days}`));
  if (a.prescription.notes) doc.moveDown().fontSize(13).text("Notes", { underline: true }).fontSize(12).text(a.prescription.notes);
  doc.end();

  return new Response(new Uint8Array(await done), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="prescription-${a.id}.pdf"` },
  });
}
