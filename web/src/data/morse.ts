/** Morse code mapping: character -> dot/dash pattern */
export const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

/** Reverse mapping: morse pattern -> character */
export const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([char, code]) => [code, char]),
);

/** Convert text to morse code string */
export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      if (char === " ") return "/";
      return MORSE_MAP[char] ?? "";
    })
    .filter((code) => code !== "")
    .join(" ");
}

/** Convert morse code string to text */
export function morseToText(morse: string): string {
  return morse
    .split(" / ")
    .map((word) =>
      word
        .split(" ")
        .map((code) => REVERSE_MORSE_MAP[code] ?? "")
        .join(""),
    )
    .join(" ");
}

/** Get all characters sorted for the reference chart */
export function getAlphabetEntries(): { char: string; morse: string }[] {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char) => ({
    char,
    morse: MORSE_MAP[char]!,
  }));
  const numbers = "0123456789".split("").map((char) => ({
    char,
    morse: MORSE_MAP[char]!,
  }));
  return [...letters, ...numbers];
}

/** Timing constants (in ms) at base speed (20 WPM) */
const BASE_DOT = 60; // ms at 20 WPM

export interface MorseTiming {
  dot: number;
  dash: number;
  elementGap: number;
  letterGap: number;
  wordGap: number;
}

/** Get timing for a given WPM */
export function getTimingForWPM(wpm: number): MorseTiming {
  // PARIS standard: 1 WPM = dot length of 1200ms
  // We use a simpler model matching the spec: at default speed use the specified values
  // Scale relative to 20 WPM base
  const scale = 20 / wpm;
  return {
    dot: BASE_DOT * scale,
    dash: BASE_DOT * 3 * scale,
    elementGap: BASE_DOT * scale,
    letterGap: BASE_DOT * 3 * scale,
    wordGap: BASE_DOT * 7 * scale,
  };
}

/** Default timing matching the spec requirements */
export function getDefaultTiming(): MorseTiming {
  return {
    dot: 100,
    dash: 300,
    elementGap: 100,
    letterGap: 300,
    wordGap: 700,
  };
}

export const WPM_OPTIONS = [5, 10, 15, 20, 25] as const;

/** Fun facts about morse code */
export const MORSE_FACTS = [
  {
    title: "Samuel Morse's Invention",
    text: "Samuel F.B. Morse, along with Alfred Vail, developed the Morse code system in the 1830s-1840s. Morse was originally a painter and only turned to telegraphy after personal tragedy — he learned of his wife's death too late because news traveled so slowly.",
  },
  {
    title: "The Titanic's SOS",
    text: 'The RMS Titanic\'s radio operators sent the distress signal "CQD CQD SOS SOS" repeatedly on the night of April 14, 1912. This was one of the first major uses of the SOS signal, which had only been adopted internationally in 1906. The nearby ship Carpathia received the signal and rescued 710 survivors.',
  },
  {
    title: "Why SOS?",
    text: 'Contrary to popular belief, SOS does not stand for "Save Our Souls" or "Save Our Ship." It was chosen purely because its Morse pattern (... --- ...) is distinctive, easy to transmit, and unmistakable. The letters were assigned after the pattern was chosen.',
  },
  {
    title: "Morse in World War II",
    text: "During WWII, Morse code was vital for military communications. The famous D-Day invasion was coordinated partly through coded Morse transmissions. Resistance fighters across Europe used Morse to communicate with Allied forces, often at great personal risk.",
  },
  {
    title: "Still Used Today",
    text: "While largely replaced by modern digital communications, Morse code is still used by amateur radio operators worldwide, in aviation (navigation beacons identify themselves in Morse), and as an accessibility tool. Some people with disabilities use Morse-based input methods on modern devices.",
  },
  {
    title: "The Fastest Morse Operators",
    text: "Champion Morse operators can send and receive at over 60 words per minute. In competitive high-speed telegraphy events, participants decode machine-sent Morse at incredible speeds. The skill requires years of practice until the patterns become second nature — experienced operators hear words, not individual dots and dashes.",
  },
];

/** Practice words of varying difficulty */
export const PRACTICE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export const PRACTICE_WORDS_EASY = [
  "SOS",
  "HI",
  "OK",
  "GO",
  "NO",
  "YES",
  "CAT",
  "DOG",
  "THE",
  "AND",
  "RUN",
  "SEE",
  "BIG",
  "RED",
  "CUT",
];

export const PRACTICE_WORDS_MEDIUM = [
  "HELLO",
  "WORLD",
  "MORSE",
  "RADIO",
  "ALPHA",
  "BRAVO",
  "DELTA",
  "ECHO",
  "OSCAR",
  "TANGO",
  "HOTEL",
  "INDIA",
  "LIMA",
  "PAPA",
  "ROMEO",
];

export const PRACTICE_SENTENCES = [
  "HELLO WORLD",
  "SOS SOS SOS",
  "GOOD MORNING",
  "COME IN PLEASE",
  "OVER AND OUT",
  "ROGER THAT",
  "WELL DONE",
  "NICE WORK",
];
