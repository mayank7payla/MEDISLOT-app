import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    where: dept ? { name: dept } : {},
    include: { doctors: { include: { user: { select: { name: true } } } } },
  });
  return (
    <>
      <h1>Find a doctor</h1>
      <p className="muted">Not sure which specialist you need? <Link href="/symptom-checker">Try the Symptom Checker</Link>
        {dept && <> &middot; Showing <b>{dept}</b> &middot; <Link href="/">show all</Link></>}</p>
      {departments.map((d) => (
        <section key={d.id}>
          <h2>{d.name}</h2>
          <div className="grid">
            {d.doctors.length === 0 && <p className="muted">No doctors listed yet.</p>}
            {d.doctors.map((doc) => (
              <div className="card" key={doc.id}>
                <b>Dr. {doc.user.name}</b>
                <p className="muted">{doc.bio}</p>
                <Link className="btn" href={`/book/${doc.id}`}>Book slot</Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
