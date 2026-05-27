import { MORSE_FACTS } from "../data/morse";

export default function FunFacts() {
  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Fun Facts
      </h3>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Interesting moments from the history of Morse code.
      </p>

      <div className="space-y-4">
        {MORSE_FACTS.map((fact, i) => (
          <div
            key={i}
            className="px-4 py-4 rounded-xl"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <h4
              className="text-sm font-bold mb-2"
              style={{ color: "var(--accent)" }}
            >
              {fact.title}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
              {fact.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
