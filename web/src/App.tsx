import { useState, useCallback } from "react";
import ReferenceChart from "./components/ReferenceChart";
import Translator from "./components/Translator";
import VisualFlasher from "./components/VisualFlasher";
import PracticeEncode from "./components/PracticeEncode";
import PracticeDecode from "./components/PracticeDecode";
import TapInput from "./components/TapInput";
import SOSButton from "./components/SOSButton";
import History from "./components/History";
import FunFacts from "./components/FunFacts";

type Tab =
  | "reference"
  | "translator"
  | "flasher"
  | "encode"
  | "decode"
  | "tap"
  | "sos"
  | "history"
  | "facts";

interface NavItem {
  id: Tab;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "reference", label: "Reference", icon: "A" },
  { id: "translator", label: "Translator", icon: "T" },
  { id: "flasher", label: "Flasher", icon: "F" },
  { id: "encode", label: "Encode", icon: "E" },
  { id: "decode", label: "Decode", icon: "D" },
  { id: "tap", label: "Tap", icon: "I" },
  { id: "sos", label: "SOS", icon: "!" },
  { id: "history", label: "History", icon: "H" },
  { id: "facts", label: "Facts", icon: "?" },
];

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "reference":
      return <ReferenceChart />;
    case "translator":
      return <Translator />;
    case "flasher":
      return <VisualFlasher />;
    case "encode":
      return <PracticeEncode />;
    case "decode":
      return <PracticeDecode />;
    case "tap":
      return <TapInput />;
    case "sos":
      return <SOSButton />;
    case "history":
      return <History />;
    case "facts":
      return <FunFacts />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("reference");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }, []);

  return (
    <div className="flex h-screen" style={{ background: "var(--paper)" }}>
      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex flex-col w-56 shrink-0 overflow-y-auto"
        style={{
          background: "var(--dock)",
          borderRight: "1px solid var(--line)",
        }}
      >
        <div className="px-4 py-4">
          <h1
            className="text-base font-bold display-font"
            style={{ color: "var(--ink)" }}
          >
            Morse Code
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
            Learn, practice, translate
          </p>
        </div>

        <div className="flex-1 px-2 pb-4">
          <div className="space-y-0.5">
            <p
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1"
              style={{ color: "var(--muted)" }}
            >
              Learn
            </p>
            {(["reference", "facts"] as Tab[]).map((id) => {
              const item = NAV_ITEMS.find((n) => n.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium cursor-pointer text-left"
                  style={{
                    background:
                      activeTab === id
                        ? "rgba(37, 99, 235, 0.1)"
                        : "transparent",
                    color:
                      activeTab === id ? "var(--accent)" : "var(--ink)",
                    border: "none",
                  }}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        activeTab === id
                          ? "var(--accent)"
                          : "var(--panel)",
                      color:
                        activeTab === id ? "#fff" : "var(--muted)",
                      border:
                        activeTab === id
                          ? "none"
                          : "1px solid var(--line)",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}

            <p
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 mt-3"
              style={{ color: "var(--muted)" }}
            >
              Tools
            </p>
            {(["translator", "flasher", "tap", "sos"] as Tab[]).map((id) => {
              const item = NAV_ITEMS.find((n) => n.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium cursor-pointer text-left"
                  style={{
                    background:
                      activeTab === id
                        ? id === "sos"
                          ? "rgba(220, 38, 38, 0.1)"
                          : "rgba(37, 99, 235, 0.1)"
                        : "transparent",
                    color:
                      activeTab === id
                        ? id === "sos"
                          ? "var(--error)"
                          : "var(--accent)"
                        : "var(--ink)",
                    border: "none",
                  }}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        activeTab === id
                          ? id === "sos"
                            ? "var(--error)"
                            : "var(--accent)"
                          : id === "sos"
                            ? "rgba(220, 38, 38, 0.1)"
                            : "var(--panel)",
                      color:
                        activeTab === id
                          ? "#fff"
                          : id === "sos"
                            ? "var(--error)"
                            : "var(--muted)",
                      border:
                        activeTab === id
                          ? "none"
                          : "1px solid var(--line)",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}

            <p
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 mt-3"
              style={{ color: "var(--muted)" }}
            >
              Practice
            </p>
            {(["encode", "decode", "history"] as Tab[]).map((id) => {
              const item = NAV_ITEMS.find((n) => n.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium cursor-pointer text-left"
                  style={{
                    background:
                      activeTab === id
                        ? "rgba(37, 99, 235, 0.1)"
                        : "transparent",
                    color:
                      activeTab === id ? "var(--accent)" : "var(--ink)",
                    border: "none",
                  }}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        activeTab === id
                          ? "var(--accent)"
                          : "var(--panel)",
                      color:
                        activeTab === id ? "#fff" : "var(--muted)",
                      border:
                        activeTab === id
                          ? "none"
                          : "1px solid var(--line)",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="px-4 py-3 text-[11px]"
          style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}
        >
          Free on FreeAppStore
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <nav
            className="relative w-64 h-full overflow-y-auto"
            style={{ background: "var(--dock)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 flex items-center justify-between">
              <h1
                className="text-base font-bold display-font"
                style={{ color: "var(--ink)" }}
              >
                Morse Code
              </h1>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
                style={{
                  background: "var(--panel)",
                  border: "none",
                  color: "var(--ink)",
                }}
                aria-label="Close navigation"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-2 pb-4 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-left"
                  style={{
                    background:
                      activeTab === item.id
                        ? "rgba(37, 99, 235, 0.1)"
                        : "transparent",
                    color:
                      activeTab === item.id
                        ? "var(--accent)"
                        : "var(--ink)",
                    border: "none",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        activeTab === item.id
                          ? item.id === "sos"
                            ? "var(--error)"
                            : "var(--accent)"
                          : item.id === "sos"
                            ? "rgba(220, 38, 38, 0.1)"
                            : "var(--panel)",
                      color:
                        activeTab === item.id
                          ? "#fff"
                          : item.id === "sos"
                            ? "var(--error)"
                            : "var(--muted)",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 flex items-center gap-3 px-4 py-3 lg:px-6"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "var(--glass)",
          }}
        >
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            style={{
              background: "var(--panel)",
              border: "none",
              color: "var(--ink)",
            }}
            aria-label="Open navigation"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1
            className="text-lg font-bold display-font hidden sm:block"
            style={{ color: "var(--ink)" }}
          >
            Morse Code
          </h1>

          {/* Desktop tab pills */}
          <div className="hidden md:flex items-center gap-1 ml-auto overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap"
                style={{
                  background:
                    activeTab === item.id
                      ? item.id === "sos"
                        ? "var(--error)"
                        : "var(--accent)"
                      : "transparent",
                  color:
                    activeTab === item.id
                      ? "#fff"
                      : "var(--muted)",
                  border: "none",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile: show current tab */}
          <span
            className="md:hidden ml-auto text-sm font-medium"
            style={{ color: "var(--muted)" }}
          >
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </span>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <TabContent tab={activeTab} />
          </div>
        </div>

        {/* Footer */}
        <footer
          className="shrink-0 flex items-center justify-center px-4 py-2 text-xs"
          style={{
            borderTop: "1px solid var(--line)",
            color: "var(--muted)",
          }}
        >
          Morse Code — Free on FreeAppStore
        </footer>
      </main>
    </div>
  );
}
