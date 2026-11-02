"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Slot = { startsAt: string; available: boolean };
const today = () => new Date().toISOString().slice(0, 10);

export default function Book() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sel, setSel] = useState<Slot | null>(null);
  const [reason, setReason] = useState(""); const [msg, setMsg] = useState("");

  async function load() {
    setSel(null);
    const r = await fetch(`/api/doctors/${doctorId}/slots?date=${date}`);
    setSlots(r.ok ? await r.json() : []);
  }
  useEffect(() => { load(); }, [date]); // eslint-disable-line

  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: false });

  async function book() {
    if (!sel) return;
    const res = await fetch("/api/appointments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, time: time(sel.startsAt), reason }),
    });
    if (res.status === 401) return router.push("/login");
    if (res.ok) { router.push("/dashboard"); router.refresh(); return; }
    setMsg((await res.json()).error ?? "Booking failed"); load();
  }

  return (
    <div className="card">
      <h2>Pick a date and time</h2>
      <input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} />
      <div className="slots">
        {slots.length === 0 && <p className="muted">Doctor is not available on this day.</p>}
        {slots.map((s) => (
          <button key={s.startsAt} disabled={!s.available} className={sel?.startsAt === s.startsAt ? "sel" : "alt"} onClick={() => setSel(s)}>
            {time(s.startsAt)}
          </button>
        ))}
      </div>
      <br />
      <textarea placeholder="Reason for visit (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      {msg && <p style={{ color: "var(--warn)" }}>{msg}</p>}
      <button disabled={!sel} onClick={book}>Confirm booking</button>
    </div>
  );
}
