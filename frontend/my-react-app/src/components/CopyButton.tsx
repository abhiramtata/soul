import React from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}
    >
      {label}
    </button>
  );
}
