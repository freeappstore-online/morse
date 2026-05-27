import { MORSE_MAP, type MorseTiming, getDefaultTiming } from "../data/morse";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Resume audio context (must be called from user gesture) */
export function ensureAudioResumed(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

/** Play a single tone for the given duration */
function playTone(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  frequency: number = 600,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.5, startTime);
  // Slight ramp to avoid clicks
  gain.gain.linearRampToValueAtTime(0.5, startTime + 0.005);
  gain.gain.setValueAtTime(0.5, startTime + duration / 1000 - 0.005);
  gain.gain.linearRampToValueAtTime(0, startTime + duration / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration / 1000);
}

export interface PlaybackHandle {
  /** Total duration of the sequence in ms */
  totalDuration: number;
  /** Cancel playback */
  cancel: () => void;
  /** Returns schedule of element timings for visual sync */
  schedule: ScheduleEntry[];
}

export interface ScheduleEntry {
  type: "dot" | "dash";
  startMs: number;
  durationMs: number;
  char: string;
  charIndex: number;
}

/** Play morse code for given text. Returns a handle to control playback. */
export function playMorseAudio(
  text: string,
  timing?: MorseTiming,
  frequency: number = 600,
): PlaybackHandle {
  const t = timing ?? getDefaultTiming();
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const schedule: ScheduleEntry[] = [];
  let currentTime = ctx.currentTime;
  let currentMs = 0;

  const upperText = text.toUpperCase();
  let charIndex = 0;

  for (const char of upperText) {
    if (char === " ") {
      currentTime += t.wordGap / 1000;
      currentMs += t.wordGap;
      charIndex++;
      continue;
    }

    const code = MORSE_MAP[char];
    if (!code) {
      charIndex++;
      continue;
    }

    for (const [i, element] of [...code].entries()) {
      if (element === ".") {
        playTone(ctx, currentTime, t.dot, frequency);
        schedule.push({
          type: "dot",
          startMs: currentMs,
          durationMs: t.dot,
          char,
          charIndex,
        });
        currentTime += t.dot / 1000;
        currentMs += t.dot;
      } else if (element === "-") {
        playTone(ctx, currentTime, t.dash, frequency);
        schedule.push({
          type: "dash",
          startMs: currentMs,
          durationMs: t.dash,
          char,
          charIndex,
        });
        currentTime += t.dash / 1000;
        currentMs += t.dash;
      }

      // Inter-element gap (not after last element in char)
      if (i < code.length - 1) {
        currentTime += t.elementGap / 1000;
        currentMs += t.elementGap;
      }
    }

    // Letter gap
    currentTime += t.letterGap / 1000;
    currentMs += t.letterGap;
    charIndex++;
  }

  const totalDuration = currentMs;

  return {
    totalDuration,
    cancel: () => {
      // Close and recreate context to stop all scheduled tones
      if (audioCtx && audioCtx === ctx) {
        void ctx.close();
        audioCtx = null;
      }
    },
    schedule,
  };
}

/** Play SOS pattern continuously. Returns cancel function. */
export function playSOS(timing?: MorseTiming): () => void {
  let cancelled = false;
  let currentHandle: PlaybackHandle | null = null;

  const playOnce = () => {
    if (cancelled) return;
    currentHandle = playMorseAudio("SOS", timing);
    setTimeout(() => {
      if (!cancelled) {
        playOnce();
      }
    }, currentHandle.totalDuration + 1000);
  };

  playOnce();

  return () => {
    cancelled = true;
    currentHandle?.cancel();
  };
}

/** Get the total playback duration for a text without actually playing */
export function getMorseDuration(text: string, timing?: MorseTiming): number {
  const t = timing ?? getDefaultTiming();
  let ms = 0;
  const upperText = text.toUpperCase();

  for (const char of upperText) {
    if (char === " ") {
      ms += t.wordGap;
      continue;
    }
    const code = MORSE_MAP[char];
    if (!code) continue;

    for (const [i, element] of [...code].entries()) {
      if (element === ".") ms += t.dot;
      else if (element === "-") ms += t.dash;
      if (i < code.length - 1) ms += t.elementGap;
    }
    ms += t.letterGap;
  }

  return ms;
}
