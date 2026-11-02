import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const dept = new URL(req.url).searchParams.get("department");
  const doctors = await prisma.doctor.findMany({
    where: dept ? { department: { name: dept } } : {},
    include: { user: { select: { name: true } }, department: true },
  });
  return NextResponse.json(doctors);
}
