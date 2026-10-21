"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State = "closed" | "open" | "half-open";
type Outcome = "ok" | "fail" | "fallback";

const WINDOW = 10; // rolling window of recent calls
const TRIP_AT = 5; // failures in window that trip the breaker
const COOL_DOWN_MS = 3500;
const TRIALS = 3; // successful trial calls needed to close again
const TICK_MS = 380;

const stateCopy: Record<State, string> = {
  closed: "Requests reach the API. Failures are being counted.",
  open: "API is skipped. Callers get the cached fallback instantly.",
  "half-open": "Letting a few trial requests through to test recovery.",
};

export default function BreakerSimulator() {
  const [failureRate, setFailureRate] = useState(10);
  const [running, setRunning] = useState(true);
  const [state, setState] = useState<State>("closed");
  const [log, setLog] = useState<Outcome[]>([]);
  const [counts, setCounts] = useState({ ok: 0, fail: 0, fallback: 0 });

  // Mutable machine internals, read inside the interval without re-subscribing
  const m = useRef({
    state: "closed" as State,
    window: [] as boolean[],
    openedAt: 0,
    trialsPassed: 0,
    failureRate: 10,
  });

  useEffect(() => {
    m.current.failureRate = failureRate;
  }, [failureRate]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setRunning(false);
  }, []);

  const tick = useCallback(() => {
    const s = m.current;
    const now = Date.now();
    let outcome: Outcome;

    if (s.state === "open" && now - s.openedAt >= COOL_DOWN_MS) {
      s.state = "half-open";
      s.trialsPassed = 0;
    }

    if (s.state === "open") {
      outcome = "fallback";
    } else {
      const failed = Math.random() * 100 < s.failureRate;
      outcome = failed ? "fail" : "ok";

      if (s.state === "half-open") {
        if (failed) {
          s.state = "open";
          s.openedAt = now;
        } else if (++s.trialsPassed >= TRIALS) {
          s.state = "closed";
          s.window = [];
        }
      } else {
        s.window = [...s.window, failed].slice(-WINDOW);
        if (s.window.filter(Boolean).length >= TRIP_AT) {
          s.state = "open";
          s.openedAt = now;
          s.window = [];
        }
      }
    }

    setState(s.state);
    setLog((l) => [...l, outcome].slice(-32));
    setCounts((c) => ({ ...c, [outcome]: c[outcome] + 1 }));
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [running, tick]);

  function reset() {
    m.current = { state: "closed", window: [], openedAt: 0, trialsPassed: 0, failureRate };
    setState("closed");
    setLog([]);
    setCounts({ ok: 0, fail: 0, fallback: 0 });
  }

  const states: State[] = ["closed", "open", "half-open"];
  const dot: Record<Outcome, string> = {
    ok: "bg-ok",
    fail: "bg-fault",
    fallback: "bg-signal",
  };

  return (
    <section
      aria-labelledby="sim-title"
      className="drafting-grid rounded-2xl border border-line bg-surface/70 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="sim-title" className="text-lg font-bold" style={{ fontStretch: "110%" }}>
            Try it: a circuit breaker
          </h2>
          <p className="mt-1 max-w-sm text-sm text-ink-soft">
            Raise the failure rate and watch the breaker protect its caller.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold hover:border-blue"
          >
            {running ? "Pause" : "Run"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold hover:border-blue"
          >
            Reset
          </button>
        </div>
      </div>

      {/* State machine */}
      <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Breaker state">
        {states.map((st) => {
          const on = st === state;
          const tone =
            st === "open" ? "border-fault text-fault" : st === "half-open" ? "border-signal text-signal" : "border-ok text-ok";
          return (
            <li
              key={st}
              aria-current={on ? "step" : undefined}
              className={`rounded-lg border-2 px-2 py-3 text-center text-sm font-bold transition-colors duration-200 ${
                on ? `${tone} bg-surface` : "border-transparent text-ink-soft/60"
              }`}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 min-h-[2.75rem] font-serif text-[15px] text-ink" aria-live="polite">
        {stateCopy[state]}
      </p>

      {/* Request stream */}
      <div className="mt-3 flex h-4 items-center gap-1 overflow-hidden" aria-hidden>
        {log.map((o, i) => (
          <span key={i} className={`h-3 w-2 shrink-0 rounded-sm ${dot[o]}`} />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-ok" />
            Served by API
          </dt>
          <dd className="mt-0.5 text-xl font-bold tabular-nums">{counts.ok}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-fault" />
            Failed calls
          </dt>
          <dd className="mt-0.5 text-xl font-bold tabular-nums">{counts.fail}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-signal" />
            Fast fallbacks
          </dt>
          <dd className="mt-0.5 text-xl font-bold tabular-nums">{counts.fallback}</dd>
        </div>
      </dl>

      <label className="mt-6 block">
        <span className="flex justify-between text-sm font-semibold">
          <span>Inventory API failure rate</span>
          <span className="tabular-nums text-ink-soft">{failureRate}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={failureRate}
          onChange={(e) => setFailureRate(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--blue)]"
        />
      </label>
      <p className="mt-2 text-xs text-ink-soft">
        Trips after {TRIP_AT} failures in the last {WINDOW} calls. Waits {COOL_DOWN_MS / 1000}s, then needs {TRIALS} good
        trial calls to close.
      </p>
    </section>
  );
}
