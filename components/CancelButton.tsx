"use client";
import { useRouter } from "next/navigation";
export default function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button className="danger" onClick={async () => {
      if (!confirm("Cancel this appointment?")) return;
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      router.refresh();
    }}>Cancel</button>
  );
}
