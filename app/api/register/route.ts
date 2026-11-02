import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });

// Public registration always creates a PATIENT. Doctors/admins are created by seed/admin only.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Name, valid email and 8+ char password required" }, { status: 400 });
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } }))
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10), role: "PATIENT", patient: { create: {} } },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
