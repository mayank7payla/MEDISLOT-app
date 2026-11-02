import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const depts = ["General Medicine", "Cardiology", "Gastroenterology", "Neurology", "Orthopedics", "Dermatology", "ENT", "Pediatrics", "Gynecology"];
const doctors = [
  ["Asha Verma", "General Medicine", "MBBS, MD. Fever, infections and everyday care."],
  ["Rohan Mehta", "Cardiology", "DM Cardiology. Heart rhythm and blood pressure."],
  ["Neha Kapoor", "Gastroenterology", "Acidity, liver and gut disorders."],
  ["Imran Sheikh", "Neurology", "Migraine, epilepsy and nerve problems."],
  ["Vikram Rao", "Orthopedics", "Joint, spine and sports injuries."],
  ["Priya Nair", "Dermatology", "Skin, hair and nail care."],
  ["Sanjay Gupta", "ENT", "Ear, nose and throat."],
  ["Kavita Joshi", "Pediatrics", "Child health and vaccination."],
  ["Meera Iyer", "Gynecology", "Women's health and pregnancy care."],
];

async function main() {
  const pw = await bcrypt.hash("Password@123", 10);
  for (const d of depts) await prisma.department.upsert({ where: { name: d }, update: {}, create: { name: d } });

  await prisma.user.upsert({ where: { email: "admin@medislot.test" }, update: {}, create: { name: "Admin", email: "admin@medislot.test", password: pw, role: "ADMIN" } });
  await prisma.user.upsert({ where: { email: "patient@medislot.test" }, update: {}, create: { name: "Demo Patient", email: "patient@medislot.test", password: pw, patient: { create: {} } } });

  for (const [i, [name, dept, bio]] of doctors.entries()) {
    const email = `doctor${i + 1}@medislot.test`;
    if (await prisma.user.findUnique({ where: { email } })) continue;
    const department = await prisma.department.findUniqueOrThrow({ where: { name: dept } });
    await prisma.user.create({
      data: {
        name, email, password: pw, role: "DOCTOR",
        doctor: { create: { departmentId: department.id, bio, slotMinutes: 30,
          // Monday to Saturday, 10:00-13:00 and 16:00-18:00
          availability: { create: [1, 2, 3, 4, 5, 6].flatMap((weekday) => [
            { weekday, startTime: "10:00", endTime: "13:00" }, { weekday, startTime: "16:00", endTime: "18:00" },
          ]) } } },
      },
    });
  }
  console.log("Seeded. Logins (password Password@123): admin@, patient@, doctor1@ ... doctor9@medislot.test");
}
main().finally(() => prisma.$disconnect());
