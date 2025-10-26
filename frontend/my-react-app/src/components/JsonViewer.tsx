import React, { useMemo, useState } from "react";
import CopyButton from "./CopyButton";

export default function JsonViewer({ data, title = "JSON", filename = "data.json" }: { data: any; title?: string; filename?: string }) {
  const [open, setOpen] = useState(true);
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setOpen(!open)} style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
            {open ? "Hide" : "View JSON"}
          </button>
          <CopyButton text={json} />
          <button onClick={download} style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
            Download
          </button>
        </div>
      </div>
      {open && <pre style={{ background: "#0f1420", border: "1px solid #273046", padding: 12, borderRadius: 10, overflow: "auto" }}><code>{json}</code></pre>}
    </div>
  );
}
