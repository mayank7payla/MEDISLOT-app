"use client";
import { useState } from "react";
import Link from "next/link";
import { TREE, type Option } from "@/lib/symptoms";

export default function SymptomChecker() {
  const [path, setPath] = useState<string[]>(["start"]);
  const [result, setResult] = useState<Option | null>(null);
  const node = TREE[path[path.length - 1]];

  function pick(o: Option) {
    if (o.next) setPath([...path, o.next]); else setResult(o);
  }
  const reset = () => { setPath(["start"]); setResult(null); };

  return (
    <div className="card">
      <h2>Symptom Checker</h2>
      <p className="muted">Guides you to the right department. It is not a diagnosis.</p>
      {!result ? (
        <>
          <h3>{node.q}</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {node.options.map((o) => <button className="alt" key={o.label} onClick={() => pick(o)}>{o.label}</button>)}
          </div>
          {path.length > 1 && <p><button onClick={() => setPath(path.slice(0, -1))}>Back</button></p>}
        </>
      ) : result.emergency ? (
        <div className="emergency">These symptoms can be serious. Go to the nearest emergency room or call your local emergency number (112 in India) right now. Do not wait for an appointment.</div>
      ) : (
        <>
          <h3>Recommended department: <span className="tag">{result.dept}</span></h3>
          {result.note && <p><b>{result.note}</b></p>}
          <Link className="btn" href={`/?dept=${encodeURIComponent(result.dept!)}`}>See {result.dept} doctors</Link>
        </>
      )}
      {result && <p><button className="alt" onClick={reset}>Start over</button></p>}
    </div>
  );
}
