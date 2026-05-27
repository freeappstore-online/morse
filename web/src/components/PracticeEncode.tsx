import { useState, useCallback, useEffect } from "react";
import {
  MORSE_MAP,
  PRACTICE_LETTERS,
  PRACTICE_WORDS_EASY,
  PRACTICE_WORDS_MEDIUM,
  PRACTICE_SENTENCES,
} from "../data/morse";
import { addSession } from "../lib/storage";

type Difficulty = "letters" | "easy-words" | "medium-words" | "sentences";

function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function getChallenge(difficulty: Difficulty): string {
  switch (difficulty) {
    case "letters":
      return getRandomItem(PRACTICE_LETTERS);
    case "easy-words":
      return getRandomItem(PRACTICE_WORDS_EASY);
    case "medium-words":
      return getRandomItem(PRACTICE_WORDS_MEDIUM);
    case "sentences":
      return getRandomItem(PRACTICE_SENTENCES);
  }
}

function getExpectedMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/";
      return MORSE_MAP[ch] ?? "";
    })
    .filter(Boolean)
    .join(" ");
}

export default function PracticeEncode() {
  const [difficulty, setDifficulty] = useState<Difficulty>("letters");
  const [challenge, setChallenge] = useState(() => getChallenge("letters"));
  const [input, setInput] = useState("");
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const expected = getExpectedMorse(challenge);

  const handleNewChallenge = useCallback(
    (diff?: Difficulty) => {
      const d = diff ?? difficulty;
      setChallenge(getChallenge(d));
      setInput("");
      setFeedback(null);
      setShowAnswer(false);
    },
    [difficulty],
  );

  const handleSubmit = useCallback(() => {
    const normalized = input.trim().replace(/\s+/g, " ");
    const isCorrect = normalized === expected;

    setTotal((t) => t + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
      setShowAnswer(true);
    }
  }, [input, expected]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !feedback) {
        handleSubmit();
      } else if (e.key === "Enter" && feedback) {
        handleNewChallenge();
      }
    },
    [feedback, handleSubmit, handleNewChallenge],
  );

  // Save session when user finishes (10+ answers)
  useEffect(() => {
    if (total > 0 && total % 10 === 0) {
      addSession({
        timestamp: Date.now(),
        mode: "encode",
        total,
        correct,
        accuracy: Math.round((correct / total) * 100),
      });
    }
  }, [total, correct]);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const difficultyOptions: { key: Difficulty; label: string }[] = [
    { key: "letters", label: "Letters" },
    { key: "easy-words", label: "Easy Words" },
    { key: "medium-words", label: "Medium Words" },
    { key: "sentences", label: "Sentences" },
  ];

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Practice: Encode
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        See the text, type the Morse code using . (dot) and - (dash). Space
        between letters, " / " between words.
      </p>

      {/* Difficulty */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {difficultyOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setDifficulty(opt.key);
              handleNewChallenge(opt.key);
              setTotal(0);
              setCorrect(0);
              setStreak(0);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
            style={{
              background:
                difficulty === opt.key ? "var(--accent)" : "var(--panel)",
              color: difficulty === opt.key ? "#fff" : "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Score bar */}
      <div
        className="flex items-center gap-4 px-3 py-2 rounded-lg mb-4 text-xs font-medium"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <span style={{ color: "var(--ink)" }}>
          Score: {correct}/{total}
        </span>
        <span style={{ color: "var(--muted)" }}>Accuracy: {accuracy}%</span>
        <span style={{ color: "var(--warning)" }}>Streak: {streak}</span>
      </div>

      {/* Challenge */}
      <div
        className="text-center py-8 rounded-xl mb-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
          Encode this:
        </p>
        <p
          className="text-4xl font-bold display-font tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          {challenge}
        </p>
      </div>

      {/* Input */}
      <div className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type morse code here (. and -)"
          className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-2"
          style={{
            background: "var(--panel)",
            border: `2px solid ${
              feedback === "correct"
                ? "var(--success)"
                : feedback === "wrong"
                  ? "var(--error)"
                  : "var(--line)"
            }`,
            color: "var(--ink)",
          }}
          disabled={!!feedback}
          autoFocus
        />
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <div
          className="px-3 py-2 rounded-lg text-sm font-medium mb-4"
          style={{ background: "rgba(22, 163, 74, 0.1)", color: "var(--success)" }}
        >
          Correct!
        </div>
      )}
      {feedback === "wrong" && showAnswer && (
        <div
          className="px-3 py-2 rounded-lg text-sm mb-4"
          style={{ background: "rgba(220, 38, 38, 0.1)", color: "var(--error)" }}
        >
          <p className="font-medium">Not quite!</p>
          <p className="font-mono mt-1">
            Expected: <strong>{expected}</strong>
          </p>
          <p className="font-mono">
            You typed: <strong>{input.trim()}</strong>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!feedback ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)", color: "#fff", border: "none" }}
          >
            Check (Enter)
          </button>
        ) : (
          <button
            onClick={() => handleNewChallenge()}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff", border: "none" }}
            autoFocus
          >
            Next (Enter)
          </button>
        )}
        <button
          onClick={() => setShowAnswer(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{
            background: "var(--panel)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          Show Answer
        </button>
      </div>

      {showAnswer && !feedback && (
        <div
          className="mt-3 px-3 py-2 rounded-lg text-sm font-mono"
          style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          Answer: {expected}
        </div>
      )}
    </div>
  );
}
