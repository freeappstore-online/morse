import { useState, useCallback, useRef, useEffect } from "react";
import { REVERSE_MORSE_MAP } from "../data/morse";
import { ensureAudioResumed } from "../lib/audio";

const DOT_THRESHOLD = 200; // ms: tap shorter than this = dot, longer = dash
const LETTER_BREAK = 500; // ms of silence = letter boundary
const WORD_BREAK = 1500; // ms of silence = word boundary

export default function TapInput() {
  const [currentElements, setCurrentElements] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [decodedText, setDecodedText] = useState("");
  const [isTapping, setIsTapping] = useState(false);
  const [tapStartTime, setTapStartTime] = useState<number | null>(null);
  const letterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
      oscRef.current?.stop();
      void audioCtxRef.current?.close();
    };
  }, []);

  const startTone = useCallback(() => {
    ensureAudioResumed();
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.value = 0.4;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
  }, []);

  const stopTone = useCallback(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = 0;
    }
    oscRef.current?.stop();
    oscRef.current = null;
    gainRef.current = null;
  }, []);

  const finalizeLetter = useCallback(
    (elements: string[]) => {
      if (elements.length === 0) return;
      const code = elements.join("");
      const char = REVERSE_MORSE_MAP[code] ?? "?";
      setCurrentWord((prev) => {
        const next = [...prev, char];
        return next;
      });
      setCurrentElements([]);
    },
    [],
  );

  const finalizeWord = useCallback(() => {
    setCurrentWord((prev) => {
      if (prev.length === 0) return prev;
      setDecodedText((text) => {
        const word = prev.join("");
        return text ? text + " " + word : word;
      });
      return [];
    });
  }, []);

  const handleTapStart = useCallback(() => {
    // Clear timers
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);

    setIsTapping(true);
    setTapStartTime(Date.now());
    startTone();
  }, [startTone]);

  const handleTapEnd = useCallback(() => {
    if (!isTapping || tapStartTime === null) return;

    stopTone();
    setIsTapping(false);

    const duration = Date.now() - tapStartTime;
    const element = duration < DOT_THRESHOLD ? "." : "-";

    setCurrentElements((prev) => {
      const next = [...prev, element];

      // Set letter break timer
      letterTimerRef.current = setTimeout(() => {
        finalizeLetter(next);

        // Set word break timer
        wordTimerRef.current = setTimeout(() => {
          finalizeWord();
        }, WORD_BREAK - LETTER_BREAK);
      }, LETTER_BREAK);

      return next;
    });

    setTapStartTime(null);
  }, [isTapping, tapStartTime, stopTone, finalizeLetter, finalizeWord]);

  const handleClear = useCallback(() => {
    setCurrentElements([]);
    setCurrentWord([]);
    setDecodedText("");
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
  }, []);

  // Handle spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        handleTapStart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTapEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleTapStart, handleTapEnd]);

  const currentCode = currentElements.join("");
  const pendingWord = currentWord.join("");

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Tap Input
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Tap the button (or hold spacebar) to input Morse code. Short tap = dot,
        long tap = dash. Pauses auto-detect letter and word boundaries.
      </p>

      {/* Tap button */}
      <div className="flex flex-col items-center mb-6">
        <button
          onMouseDown={handleTapStart}
          onMouseUp={handleTapEnd}
          onMouseLeave={() => {
            if (isTapping) handleTapEnd();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTapStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTapEnd();
          }}
          className="w-40 h-40 rounded-full text-lg font-bold cursor-pointer select-none transition-all duration-75 active:scale-95"
          style={{
            background: isTapping ? "var(--accent)" : "var(--panel)",
            color: isTapping ? "#fff" : "var(--ink)",
            border: `3px solid ${isTapping ? "var(--accent)" : "var(--line)"}`,
            boxShadow: isTapping
              ? "0 0 40px rgba(37, 99, 235, 0.4)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {isTapping ? "..." : "TAP"}
        </button>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
          Short tap = dot ({DOT_THRESHOLD}ms) | Long tap = dash | Spacebar works
          too
        </p>
      </div>

      {/* Current input display */}
      <div
        className="px-4 py-3 rounded-lg mb-4"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-4 mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            Current:
          </span>
          <span className="font-mono text-lg tracking-wider" style={{ color: "var(--ink)" }}>
            {currentCode && (
              <span>
                {currentCode}{" "}
                <span style={{ color: "var(--muted)" }}>
                  ({REVERSE_MORSE_MAP[currentCode] ?? "..."})
                </span>
              </span>
            )}
          </span>
        </div>

        {pendingWord && (
          <div className="flex items-center gap-4 mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              Word:
            </span>
            <span className="font-mono text-lg" style={{ color: "var(--accent)" }}>
              {pendingWord}
            </span>
          </div>
        )}
      </div>

      {/* Decoded output */}
      <div className="mb-4">
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--muted)" }}
        >
          Decoded Text
        </label>
        <div
          className="w-full px-3 py-2 rounded-lg text-lg font-mono min-h-[48px]"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        >
          {decodedText || (
            <span style={{ color: "var(--muted)" }}>
              Start tapping to decode...
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleClear}
        className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        style={{
          background: "var(--panel)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
        }}
      >
        Clear
      </button>
    </div>
  );
}
