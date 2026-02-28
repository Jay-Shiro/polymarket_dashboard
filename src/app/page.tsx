"use client";
import React, { useState } from "react";

interface Metrics {
  liquidity: string | number;
  volume: string | number;
  impliedProbability: number;
  spread: string | number;
  timeToResolution: string;
  historicalPrices?: number[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const parseMetricValue = (value: string | number): number => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    }

    const normalized = value.replace(/,/g, "").replace(/[^0-9.-]/g, "");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  };

  const liquidityValue = metrics ? parseMetricValue(metrics.liquidity) : 0;
  const volumeValue = metrics ? parseMetricValue(metrics.volume) : 0;
  const strengthMax = Math.max(liquidityValue, volumeValue, 1);

  const liquidityWidth = metrics
    ? `${Math.max(2, Math.min(100, (liquidityValue / strengthMax) * 100))}%`
    : "22%";

  const volumeWidth = metrics
    ? `${Math.max(2, Math.min(100, (volumeValue / strengthMax) * 100))}%`
    : "22%";

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setMetrics(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze market");
      setMetrics(data.metrics);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-100 via-zinc-50 to-white px-3 py-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-black sm:px-6 sm:py-10">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-2xl border border-zinc-200/70 bg-white/90 p-4 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:gap-10 sm:p-8">
        <header className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">Polymarket Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base sm:text-lg">Analyze Polymarket markets and visualize key metrics to help inform your decisions.</p>
        </header>

        {/* Polymarket URL Input */}
        <section className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-6 sm:py-5">
          <label htmlFor="market-url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Polymarket URL</label>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <input
              id="market-url"
              type="url"
              placeholder="https://polymarket.com/market/..."
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
            />
            <button
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:w-auto"
              onClick={handleAnalyze}
              disabled={loading || !url}
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </section>

        {/* Visualization Section */}
        <section className="flex w-full flex-col gap-4 rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-6 sm:py-5">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Market Visualizations</h2>
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-3 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Historical Price Trend</div>
              <div className="relative h-44 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="absolute inset-x-3 bottom-3 top-3 flex items-end gap-1">
                  {(metrics?.historicalPrices?.length ? metrics.historicalPrices : [0, 0, 0, 0, 0, 0, 0]).map((point, index) => {
                    const height = metrics?.historicalPrices?.length
                      ? `${Math.max(12, Math.min(100, point * 100))}%`
                      : "18%";
                    return (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-zinc-300 transition-all dark:bg-zinc-600"
                        style={{ height }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-3 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Market Strength Mix</div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Liquidity</span>
                    <span>{metrics ? String(metrics.liquidity) : "--"}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-2 rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                      style={{ width: liquidityWidth }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Volume</span>
                    <span>{metrics ? String(metrics.volume) : "--"}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-2 rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                      style={{ width: volumeWidth }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Implied Probability</span>
                    <span>{metrics ? `${(metrics.impliedProbability * 100).toFixed(2)}%` : "--"}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-2 rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                      style={{ width: metrics ? `${Math.max(0, Math.min(100, metrics.impliedProbability * 100))}%` : "22%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Spread</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{metrics ? String(metrics.spread) : "--"}</div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Time to Resolution</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{metrics ? metrics.timeToResolution : "--"}</div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Trade Signal</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{metrics ? "Active" : "Pending"}</div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Degen Risk</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{metrics ? "Medium" : "--"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Documentation */}
        <section className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Metrics Documentation</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Liquidity: Indicates how easily you can enter/exit positions.</li>
            <li>Volume: Shows recent trading activity and market interest.</li>
            <li>Implied Probability: The market&apos;s consensus on the event outcome.</li>
            <li>Spread: The difference between buy and sell prices, reflecting market efficiency.</li>
            <li>Time to Resolution: How soon the market will resolve.</li>
            <li>Historical Price Trends: Past price movements for context.</li>
            <li>Trade Signals: Automated or manual indicators suggesting buy/sell/hold actions.</li>
            <li>Kelly Fraction: Optimal bet size based on edge and odds, for maximizing long-term growth.</li>
            <li>Volatility: Measures price fluctuations and risk in the market.</li>
            <li>Degen Risk: Subjective risk score for highly speculative or volatile markets.</li>
          </ul>
        </section>

        {/* Disclaimer */}
        <footer className="mt-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 sm:px-6">
          <strong>Disclaimer:</strong> This dashboard is for informational purposes only and does not constitute financial advice. You are solely responsible for any decisions and outcomes based on the information provided.
        </footer>
      </main>
    </div>
  );
}