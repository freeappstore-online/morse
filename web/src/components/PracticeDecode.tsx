import { useState, useCallback, useEffect, useRef } from "react";
import {
  MORSE_MAP,
  PRACTICE_LETTERS,
  PRACTICE_WORDS_EASY,
  PRACTICE_WORDS_MEDIUM,
  getDefaultTiming,
  getTimingForWPM,
} from "../data/morse";
import { playMorseAudio, ensureAudioResumed } from "../lib/audio";
import { addSession } from "../lib/storage";
import SpeedControl from "./SpeedControl";

type Difficulty = "letters" | "easy-words" | "medium-words";
type DisplayMode = "audio" | "visual" | "both";

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
  }
}

function getMorseForText(text: string): string {
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

export default function PracticeDecode() {
  const [difficulty, setDifficulty] = useState<Difficulty>("letters");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("both");
  const [challenge, setChallenge] = useState(() => getChallenge("letters"));
  const [input, setInput] = useState("");
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wpm, setWpm] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const morsePattern = getMorseForText(challenge);

  const clearTimeouts = useCallback(() => {
    for (const t of timeoutsRef.current) {
      clearTimeout(t);
    }
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimeouts();
      cancelRef.current?.();
    };
  }, [clearTimeouts]);

  const handlePlayChallenge = useCallback(() => {
    ensureAudioResumed();
    if (isPlaying) {
      cancelRef.current?.();
      clearTimeouts();
      setIsPlaying(false);
      setFlashOn(false);
      return;
    }

    const timing = wpm === 15 ? getDefaultTiming() : getTimingForWPM(wpm);
    const handle = playMorseAudio(challenge, timing);
    cancelRef.current = handle.cancel;
    setIsPlaying(true);

    if (displayMode === "visual" || displayMode === "both") {
      for (const entry of handle.schedule) {
        const onT = setTimeout(() => setFlashOn(true), entry.startMs);
        timeoutsRef.current.push(onT);
        const offT = setTimeout(
          () => setFlashOn(false),
          entry.startMs + entry.durationMs,
        );
        timeoutsRef.current.push(offT);
      }
    }

    const endT = setTimeout(() => {
      setIsPlaying(false);
      setFlashOn(false);
    }, handle.totalDuration + 100);
    timeoutsRef.current.push(endT);
  }, [challenge, wpm, isPlaying, displayMode, clearTimeouts]);

  const handleNewChallenge = useCallback(
    (diff?: Difficulty) => {
      const d = diff ?? difficulty;
      setChallenge(getChallenge(d));
      setInput("");
      setFeedback(null);
      clearTimeouts();
      cancelRef.current?.();
      setIsPlaying(false);
      setFlashOn(false);
    },
    [difficulty, clearTimeouts],
  );

  const handleSubmit = useCallback(() => {
    const isCorrect =
      input.trim().toUpperCase() === challenge.toUpperCase();

    setTotal((t) => t + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
  }, [input, challenge]);

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

  useEffect(() => {
    if (total > 0 && total % 10 === 0) {
      addSession({
        timestamp: Date.now(),
        mode: "decode",
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
  ];

  const modeOptions: { key: DisplayMode; label: string }[] = [
    { key: "audio", label: "Audio Only" },
    { key: "visual", label: "Visual Only" },
    { key: "both", label: "Audio + Visual" },
  ];

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Practice: Decode
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Listen to the morse code (or watch the visual pattern) and type the
        letter or word.
      </p>

      {/* Difficulty + Display mode */}
      <div className="flex gap-2 mb-3 flex-wrap">
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
      <div className="flex gap-2 mb-4 flex-wrap">
        {modeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setDisplayMode(opt.key)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer"
            style={{
              background:
                displayMode === opt.key ? "var(--accent)" : "var(--panel)",
              color: displayMode === opt.key ? "#fff" : "var(--ink)",
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

      {/* Challenge area */}
      <div
        className="flex flex-col items-center py-8 rounded-xl mb-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        {/* Visual indicator */}
        {(displayMode === "visual" || displayMode === "both") && (
          <div
            className="w-24 h-24 rounded-full mb-4 transition-all duration-75"
            style={{
              background: flashOn ? "var(--accent)" : "var(--line)",
              boxShadow: flashOn
                ? "0 0 40px rgba(37, 99, 235, 0.5)"
                : "none",
            }}
          />
        )}

        {/* Pattern display (hidden during audio-only until after answer) */}
        {displayMode !== "audio" && (
          <p
            className="text-lg font-mono tracking-wider"
            style={{ color: "var(--ink)" }}
          >
            {morsePattern}
          </p>
        )}

        <button
          onClick={handlePlayChallenge}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"
          style={{
            background: isPlaying ? "var(--error)" : "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          {isPlaying ? (
            "Stop"
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </>
          )}
        </button>
      </div>

      {/* Speed */}
      <div className="mb-4">
        <SpeedControl wpm={wpm} onChange={setWpm} />
      </div>

      {/* Input */}
      <div className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type the decoded text..."
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
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
          style={{
            background: "rgba(22, 163, 74, 0.1)",
            color: "var(--success)",
          }}
        >
          Correct! The answer was: {challenge}
        </div>
      )}
      {feedback === "wrong" && (
        <div
          className="px-3 py-2 rounded-lg text-sm mb-4"
          style={{
            background: "rgba(220, 38, 38, 0.1)",
            color: "var(--error)",
          }}
        >
          <p className="font-medium">
            Not quite! The answer was: <strong>{challenge}</strong>
          </p>
          <p className="font-mono mt-1">Morse: {morsePattern}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!feedback ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            Check (Enter)
          </button>
        ) : (
          <button
            onClick={() => handleNewChallenge()}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
            autoFocus
          >
            Next (Enter)
          </button>
        )}
      </div>
    </div>
  );
}
