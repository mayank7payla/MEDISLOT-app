"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "" }); const [err, setErr] = useState("");
  async function submit() {
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (!res.ok) return setErr((await res.json()).error ?? "Failed");
    await signIn("credentials", { email: f.email, password: f.password, redirect: false });
    router.push("/dashboard"); router.refresh();
  }
  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Patient registration</h2>
      <input placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input placeholder="Password (8+ chars)" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      {err && <p style={{ color: "var(--warn)" }}>{err}</p>}
      <button onClick={submit}>Create account</button>
    </div>
  );
}
