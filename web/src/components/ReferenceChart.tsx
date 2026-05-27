import { getAlphabetEntries } from "../data/morse";

function MorseVisual({ pattern }: { pattern: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {pattern.split("").map((el, i) =>
        el === "." ? (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: "var(--accent)" }}
          />
        ) : (
          <span
            key={i}
            className="w-7 h-2.5 rounded-full inline-block"
            style={{ background: "var(--accent)" }}
          />
        ),
      )}
    </span>
  );
}

export default function ReferenceChart() {
  const entries = getAlphabetEntries();
  const letters = entries.filter((e) => /[A-Z]/.test(e.char));
  const numbers = entries.filter((e) => /[0-9]/.test(e.char));

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Morse Code Reference
      </h3>

      {/* Letters */}
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--muted)" }}
      >
        Letters
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
        {letters.map((entry) => (
          <div
            key={entry.char}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <span
              className="text-lg font-bold w-6 text-center"
              style={{ color: "var(--accent)" }}
            >
              {entry.char}
            </span>
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-mono tracking-wider"
                style={{ color: "var(--ink)" }}
              >
                {entry.morse}
              </span>
              <MorseVisual pattern={entry.morse} />
            </div>
          </div>
        ))}
      </div>

      {/* Numbers */}
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--muted)" }}
      >
        Numbers
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {numbers.map((entry) => (
          <div
            key={entry.char}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <span
              className="text-lg font-bold w-6 text-center"
              style={{ color: "var(--accent)" }}
            >
              {entry.char}
            </span>
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-mono tracking-wider"
                style={{ color: "var(--ink)" }}
              >
                {entry.morse}
              </span>
              <MorseVisual pattern={entry.morse} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
