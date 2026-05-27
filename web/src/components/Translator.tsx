import { useState, useCallback } from "react";
import { textToMorse, morseToText, MORSE_MAP, getDefaultTiming, getTimingForWPM } from "../data/morse";
import { playMorseAudio, ensureAudioResumed } from "../lib/audio";
import SpeedControl from "./SpeedControl";

type Direction = "text-to-morse" | "morse-to-text";

export default function Translator() {
  const [direction, setDirection] = useState<Direction>("text-to-morse");
  const [input, setInput] = useState("");
  const [wpm, setWpm] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null);

  const output =
    direction === "text-to-morse" ? textToMorse(input) : morseToText(input);

  const handleSwap = useCallback(() => {
    setDirection((d) =>
      d === "text-to-morse" ? "morse-to-text" : "text-to-morse",
    );
    setInput("");
  }, []);

  const handlePlay = useCallback(() => {
    ensureAudioResumed();
    if (isPlaying && cancelFn) {
      cancelFn();
      setIsPlaying(false);
      setCancelFn(null);
      return;
    }

    const textToPlay =
      direction === "text-to-morse" ? input : morseToText(input);
    if (!textToPlay.trim()) return;

    const timing = wpm === 15 ? getDefaultTiming() : getTimingForWPM(wpm);
    const handle = playMorseAudio(textToPlay, timing);
    setIsPlaying(true);
    setCancelFn(() => handle.cancel);

    setTimeout(() => {
      setIsPlaying(false);
      setCancelFn(null);
    }, handle.totalDuration);
  }, [input, direction, wpm, isPlaying, cancelFn]);

  const textPlaceholder =
    direction === "text-to-morse"
      ? "Type text here (e.g., HELLO WORLD)"
      : "Type morse here (e.g., .... . .-.. .-.. --- / .-- --- .-. .-.. -..)";

  const outputLabel =
    direction === "text-to-morse" ? "Morse Code" : "Plain Text";

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Translator
      </h3>

      {/* Direction toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            setDirection("text-to-morse");
            setInput("");
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer"
          style={{
            background:
              direction === "text-to-morse"
                ? "var(--accent)"
                : "var(--panel)",
            color:
              direction === "text-to-morse" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          Text to Morse
        </button>
        <button
          onClick={handleSwap}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--muted)",
          }}
          aria-label="Swap direction"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            setDirection("morse-to-text");
            setInput("");
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer"
          style={{
            background:
              direction === "morse-to-text"
                ? "var(--accent)"
                : "var(--panel)",
            color:
              direction === "morse-to-text" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          Morse to Text
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--muted)" }}
        >
          {direction === "text-to-morse" ? "Text" : "Morse Code"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={textPlaceholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            focusRingColor: "var(--accent)",
          }}
        />
        {direction === "morse-to-text" && (
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Use spaces between letters, " / " between words
          </p>
        )}
      </div>

      {/* Output */}
      <div className="mb-4">
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--muted)" }}
        >
          {outputLabel}
        </label>
        <div
          className="w-full px-3 py-2 rounded-lg text-sm font-mono min-h-[60px] break-all"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          {output || (
            <span style={{ color: "var(--muted)" }}>
              Output will appear here...
            </span>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handlePlay}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            background: isPlaying ? "var(--error)" : "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Audio
            </>
          )}
        </button>
        <SpeedControl wpm={wpm} onChange={setWpm} />
      </div>

      {/* Quick reference for common punctuation */}
      {direction === "text-to-morse" && (
        <div className="mt-4">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--muted)" }}
          >
            Supported Punctuation
          </p>
          <div className="flex flex-wrap gap-2">
            {[".", ",", "?", "!", "/", "(", ")", "&", ":", ";", "=", "+", "-", "@"].map(
              (p) => (
                <span
                  key={p}
                  className="px-2 py-1 rounded text-xs font-mono"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                  }}
                >
                  {p} = {MORSE_MAP[p] ?? ""}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
