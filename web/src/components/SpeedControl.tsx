import { WPM_OPTIONS } from "../data/morse";

interface SpeedControlProps {
  wpm: number;
  onChange: (wpm: number) => void;
}

export default function SpeedControl({ wpm, onChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
        Speed:
      </span>
      <div className="flex gap-1">
        {WPM_OPTIONS.map((w) => (
          <button
            key={w}
            onClick={() => onChange(w)}
            className="px-2 py-1 text-xs font-medium rounded cursor-pointer"
            style={{
              background: wpm === w ? "var(--accent)" : "var(--panel)",
              color: wpm === w ? "#fff" : "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            {w}
          </button>
        ))}
      </div>
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        WPM
      </span>
    </div>
  );
}
