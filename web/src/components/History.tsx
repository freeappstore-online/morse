import { useState, useMemo } from "react";
import { getSessions, clearSessions, type PracticeSession } from "../lib/storage";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const [sessions, setSessions] = useState<PracticeSession[]>(getSessions);

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    const totalQuestions = sessions.reduce((s, sess) => s + sess.total, 0);
    const totalCorrect = sessions.reduce((s, sess) => s + sess.correct, 0);
    const avgAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const encodeSessions = sessions.filter((s) => s.mode === "encode");
    const decodeSessions = sessions.filter((s) => s.mode === "decode");
    return {
      totalSessions: sessions.length,
      totalQuestions,
      totalCorrect,
      avgAccuracy,
      encodeSessions: encodeSessions.length,
      decodeSessions: decodeSessions.length,
    };
  }, [sessions]);

  // Accuracy trend (last 10 sessions)
  const recentSessions = sessions.slice(-10);

  const handleClear = () => {
    clearSessions();
    setSessions([]);
  };

  return (
    <div>
      <h3
        className="text-lg font-bold display-font mb-4"
        style={{ color: "var(--ink)" }}
      >
        Practice History
      </h3>

      {!stats ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: "var(--panel)" }}
        >
          <p className="text-3xl mb-2">-</p>
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            No practice sessions yet
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Complete 10 questions in Encode or Decode practice to save a session
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div
              className="px-3 py-3 rounded-lg text-center"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {stats.totalSessions}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Sessions
              </p>
            </div>
            <div
              className="px-3 py-3 rounded-lg text-center"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {stats.totalQuestions}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Questions
              </p>
            </div>
            <div
              className="px-3 py-3 rounded-lg text-center"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--success)" }}
              >
                {stats.avgAccuracy}%
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Avg Accuracy
              </p>
            </div>
            <div
              className="px-3 py-3 rounded-lg text-center"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {stats.encodeSessions}/{stats.decodeSessions}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Encode/Decode
              </p>
            </div>
          </div>

          {/* Accuracy trend */}
          <div className="mb-6">
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--muted)" }}
            >
              Accuracy Trend (last 10 sessions)
            </h4>
            <div
              className="flex items-end gap-2 h-32 px-3 py-2 rounded-lg"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
              }}
            >
              {recentSessions.map((sess, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                    {sess.accuracy}%
                  </span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(sess.accuracy, 5)}%`,
                      background:
                        sess.accuracy >= 80
                          ? "var(--success)"
                          : sess.accuracy >= 50
                            ? "var(--warning)"
                            : "var(--error)",
                      minHeight: "4px",
                    }}
                  />
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                    {sess.mode === "encode" ? "E" : "D"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session list */}
          <div className="mb-4">
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--muted)" }}
            >
              All Sessions
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...sessions].reverse().map((sess, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background:
                          sess.mode === "encode"
                            ? "rgba(37, 99, 235, 0.1)"
                            : "rgba(139, 92, 246, 0.1)",
                        color:
                          sess.mode === "encode"
                            ? "var(--accent)"
                            : "#8b5cf6",
                      }}
                    >
                      {sess.mode === "encode" ? "Encode" : "Decode"}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      {formatDate(sess.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "var(--ink)" }}>
                      {sess.correct}/{sess.total}
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        color:
                          sess.accuracy >= 80
                            ? "var(--success)"
                            : sess.accuracy >= 50
                              ? "var(--warning)"
                              : "var(--error)",
                      }}
                    >
                      {sess.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              background: "var(--panel)",
              color: "var(--error)",
              border: "1px solid var(--line)",
            }}
          >
            Clear History
          </button>
        </>
      )}
    </div>
  );
}
