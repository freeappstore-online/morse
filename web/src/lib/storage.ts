const STORAGE_KEY = "morse-practice-history";

export interface PracticeSession {
  timestamp: number;
  mode: "encode" | "decode";
  total: number;
  correct: number;
  accuracy: number;
}

export function getSessions(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PracticeSession[];
  } catch {
    return [];
  }
}

export function addSession(session: PracticeSession): void {
  const sessions = getSessions();
  sessions.push(session);
  // Keep last 100 sessions
  const trimmed = sessions.slice(-100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
