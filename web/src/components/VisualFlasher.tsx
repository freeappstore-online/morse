import { useState, useCallback, useRef, useEffect } from "react";
import { textToMorse, getDefaultTiming, getTimingForWPM } from "../data/morse";
import { ensureAudioResumed, playMorseAudio } from "../lib/audio";
import SpeedControl from "./SpeedControl";

export default function VisualFlasher() {
  const [text, setText] = useState("SOS");
  const [wpm, setWpm] = useState(15);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [currentChar, setCurrentChar] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const handleStart = useCallback(() => {
    if (isFlashing) {
      setIsFlashing(false);
      setFlashOn(false);
      setCurrentChar("");
      clearTimeouts();
      cancelRef.current?.();
      cancelRef.current = null;
      return;
    }

    if (!text.trim()) return;
    ensureAudioResumed();

    const timing = wpm === 15 ? getDefaultTiming() : getTimingForWPM(wpm);
    const handle = playMorseAudio(text, timing);
    cancelRef.current = handle.cancel;
    setIsFlashing(true);

    // Schedule visual flashes based on the audio schedule
    for (const entry of handle.schedule) {
      const onTimeout = setTimeout(() => {
        setFlashOn(true);
        setCurrentChar(entry.char);
      }, entry.startMs);
      timeoutsRef.current.push(onTimeout);

      const offTimeout = setTimeout(() => {
        setFlashOn(false);
      }, entry.startMs + entry.durationMs);
      timeoutsRef.current.push(offTimeout);
    }

    // End
    const endTimeout = setTimeout(() => {
      setIsFlashing(false);
      setFlashOn(false);
      setCurrentChar("");
      cancelRef.current = null;
    }, handle.totalDuration + 100);
    timeoutsRef.current.push(endTimeout);
  }, [text, wpm, isFlashing, clearTimeouts]);

  const morseOutput = textToMorse(text);

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Visual Flasher
      </h3>

      {/* Flash display */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center transition-all duration-75 mb-4"
          style={{
            background: flashOn ? "var(--accent)" : "var(--panel)",
            border: `3px solid ${flashOn ? "var(--accent)" : "var(--line)"}`,
            boxShadow: flashOn
              ? "0 0 60px rgba(37, 99, 235, 0.6)"
              : "none",
          }}
        >
          <span
            className="text-4xl font-bold"
            style={{
              color: flashOn ? "#fff" : "var(--muted)",
            }}
          >
            {isFlashing ? currentChar || "-" : ""}
          </span>
        </div>

        {/* Morse pattern display */}
        {morseOutput && (
          <div
            className="text-center px-4 py-2 rounded-lg font-mono text-sm max-w-full break-all"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
          >
            {morseOutput}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mb-4">
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--muted)" }}
        >
          Text to Flash
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
          disabled={isFlashing}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={!text.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            background: isFlashing ? "var(--error)" : "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          {isFlashing ? "Stop" : "Flash"}
        </button>
        <SpeedControl wpm={wpm} onChange={setWpm} />
      </div>
    </div>
  );
}
