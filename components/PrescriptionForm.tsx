"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrescriptionForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState([{ name: "", dose: "", days: "" }]);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    const medicines = meds.filter((m) => m.name.trim());
    const res = await fetch("/api/prescriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, diagnosis, medicines, notes }),
    });
    if (!res.ok) return setErr((await res.json()).error ?? "Failed");
    setOpen(false); router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)}>Write prescription</button>;
  return (
    <div className="card">
      <input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
      {meds.map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 6 }}>
          {(["name", "dose", "days"] as const).map((k) => (
            <input key={k} placeholder={k === "name" ? "Medicine" : k === "dose" ? "Dose (1-0-1)" : "Duration (5 days)"}
              value={m[k]} onChange={(e) => setMeds(meds.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} />
          ))}
        </div>
      ))}
      <button className="alt" onClick={() => setMeds([...meds, { name: "", dose: "", days: "" }])}>+ medicine</button>
      <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {err && <p style={{ color: "var(--warn)" }}>{err}</p>}
      <button onClick={save}>Save & complete visit</button>
    </div>
  );
}
