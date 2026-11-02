"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState("");
  async function submit() {
    const r = await signIn("credentials", { email, password, redirect: false });
    if (r?.error) setErr("Wrong email or password"); else { router.push("/dashboard"); router.refresh(); }
  }
  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {err && <p style={{ color: "var(--warn)" }}>{err}</p>}
      <button onClick={submit}>Login</button>
    </div>
  );
}
