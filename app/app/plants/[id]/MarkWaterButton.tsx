"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkWaterButton({ plantId }: { plantId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const mark = async () => {
    try {
      setBusy(true);
      const composite = `${plantId}:water`;
      const r = await fetch(`/api/tasks/${encodeURIComponent(composite)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      // Refresh the page data (and your /app list when you go back)
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to mark watered");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={mark}
      disabled={busy}
      className="w-full rounded-lg bg-neutral-900 text-white py-3 font-medium disabled:opacity-50"
    >
      {busy ? "Marking…" : "Mark Watered"}
    </button>
  );
}
