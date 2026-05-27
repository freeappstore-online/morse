import { useState, useCallback, useRef, useEffect } from "react";
import { getDefaultTiming } from "../data/morse";
import { ensureAudioResumed, playMorseAudio } from "../lib/audio";

export default function SOSButton() {
  const [isActive, setIsActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const cancelledRef = useRef(false);
  const cancelAudioRef = useRef<(() => void) | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    for (const t of timeoutsRef.current) {
      clearTimeout(t);
    }
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearTimeouts();
      cancelAudioRef.current?.();
    };
  }, [clearTimeouts]);

  const playSosLoop = useCallback(() => {
    if (cancelledRef.current) return;

    const timing = getDefaultTiming();
    const handle = playMorseAudio("SOS", timing);
    cancelAudioRef.current = handle.cancel;

    // Schedule visual flashes
    for (const entry of handle.schedule) {
      const onT = setTimeout(() => {
        if (!cancelledRef.current) setFlashOn(true);
      }, entry.startMs);
      timeoutsRef.current.push(onT);

      const offT = setTimeout(() => {
        if (!cancelledRef.current) setFlashOn(false);
      }, entry.startMs + entry.durationMs);
      timeoutsRef.current.push(offT);
    }

    // Loop after this round finishes
    const loopT = setTimeout(() => {
      if (!cancelledRef.current) {
        playSosLoop();
      }
    }, handle.totalDuration + 500);
    timeoutsRef.current.push(loopT);
  }, []);

  const handleToggle = useCallback(() => {
    ensureAudioResumed();

    if (isActive) {
      cancelledRef.current = true;
      cancelAudioRef.current?.();
      clearTimeouts();
      setFlashOn(false);
      setIsActive(false);
    } else {
      cancelledRef.current = false;
      setIsActive(true);
      playSosLoop();
    }
  }, [isActive, clearTimeouts, playSosLoop]);

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        SOS Signal
      </h3>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Sends the international distress signal: ... --- ... (SOS). Audio and
        visual flash repeat continuously.
      </p>

      <div className="flex flex-col items-center">
        {/* SOS Visual */}
        <div
          className="w-64 h-64 rounded-full flex items-center justify-center cursor-pointer select-none transition-all duration-75 mb-6"
          onClick={handleToggle}
          style={{
            background: isActive
              ? flashOn
                ? "var(--error)"
                : "rgba(220, 38, 38, 0.3)"
              : "var(--error)",
            border: `4px solid ${isActive && flashOn ? "var(--error)" : "rgba(220, 38, 38, 0.5)"}`,
            boxShadow: isActive && flashOn
              ? "0 0 80px rgba(220, 38, 38, 0.7), 0 0 120px rgba(220, 38, 38, 0.3)"
              : isActive
                ? "0 0 30px rgba(220, 38, 38, 0.3)"
                : "0 4px 16px rgba(220, 38, 38, 0.3)",
          }}
        >
          <div className="text-center">
            <p className="text-5xl font-extrabold text-white tracking-wider">
              SOS
            </p>
            <p className="text-lg font-mono text-white/80 mt-2">
              ... --- ...
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="px-6 py-3 rounded-xl text-base font-bold cursor-pointer"
          style={{
            background: isActive ? "var(--panel)" : "var(--error)",
            color: isActive ? "var(--ink)" : "#fff",
            border: isActive ? "1px solid var(--line)" : "none",
          }}
        >
          {isActive ? "Stop SOS" : "Send SOS"}
        </button>

        {isActive && (
          <p
            className="text-xs mt-3 font-medium animate-pulse"
            style={{ color: "var(--error)" }}
          >
            SOS signal active...
          </p>
        )}
      </div>
    </div>
  );
}
