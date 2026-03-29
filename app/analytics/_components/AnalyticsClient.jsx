"use client";

import { useState, useTransition } from "react";
import { getSpendingHeatmap } from "@/actions/spendingHeatmap";

// ─── Heatmap color levels ─────────────────────────────────────────
const LEVEL_COLORS = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-600 dark:bg-emerald-500",
  "bg-emerald-800 dark:bg-emerald-300",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_ABBR = ["S","M","T","W","T","F","S"];

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function AnalyticsClient({ initialData }) {
  const [data, setData]         = useState(initialData);
  const [range, setRange]       = useState(12);
  const [tooltip, setTooltip]   = useState(null);
  const [pending, start]        = useTransition();

  const changeRange = (months) => {
    setRange(months);
    start(async () => {
      const res = await getSpendingHeatmap({ months });
      if (res.success) setData(res.data);
    });
  };

  if (!data) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      No spending data found. Add some transactions to see your analytics.
    </div>
  );

  const { heatmapData, thresholds, topDays, categoryTotals, totalSpend, activeDays, monthlySummary } = data;

  // Build week columns
  const weeks = buildWeeks(heatmapData);
  const monthLabels = buildMonthLabels(heatmapData);
  const topCategories = Object.entries(categoryTotals ?? {}).slice(0, 8);
  const maxCatSpend = topCategories[0]?.[1] ?? 1;

  return (
    <div className="space-y-8">
      {/* Range selector */}
      <div className="flex gap-2">
        {[3, 6, 12].map((m) => (
          <button
            key={m}
            onClick={() => changeRange(m)}
            disabled={pending}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              range === m
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}M
          </button>
        ))}
        {pending && <span className="text-xs text-muted-foreground self-center">Loading…</span>}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total spent" value={fmt(totalSpend)} />
        <StatCard label="Active days" value={`${activeDays} days`} />
        <StatCard label="Daily avg" value={activeDays ? fmt(Math.round(totalSpend / activeDays)) : "—"} />
        <StatCard label="Top category" value={topCategories[0]?.[0] ?? "—"} capitalize />
      </div>

      {/* Heatmap */}
      <div className="border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold">Daily Spending Calendar</h2>

        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: 28 }}>
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground shrink-0"
                style={{ marginLeft: i === 0 ? 0 : m.gap * 14 }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] shrink-0" style={{ width: 20 }}>
              {DAYS_ABBR.map((d, i) => (
                <div
                  key={i}
                  className="text-[9px] text-muted-foreground h-[12px] leading-3 text-right pr-1"
                  style={{ visibility: i % 2 !== 0 ? "visible" : "hidden" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) =>
                    day ? (
                      <div
                        key={di}
                        className={`w-[12px] h-[12px] rounded-[2px] cursor-default transition-opacity hover:opacity-70 ${LEVEL_COLORS[day.level]}`}
                        onMouseEnter={(e) => setTooltip({ day, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    ) : (
                      <div key={di} className="w-[12px] h-[12px]" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {LEVEL_COLORS.map((cls, i) => (
              <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
            {thresholds && (
              <span className="text-[10px] text-muted-foreground ml-2">
                Thresholds: {fmt(thresholds.p25)} · {fmt(thresholds.p50)} · {fmt(thresholds.p75)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column: categories + top days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category breakdown */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">Spending by Category</h2>
          {topCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground">No expense data.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([cat, amt]) => {
                const pct = Math.round((amt / totalSpend) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize font-medium">{cat}</span>
                      <span className="text-muted-foreground">{fmt(amt)} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round((amt / maxCatSpend) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top spending days */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold">Highest Spending Days</h2>
          {!topDays?.length ? (
            <p className="text-xs text-muted-foreground">No data.</p>
          ) : (
            <div className="space-y-2">
              {topDays.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "short",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.count} transactions</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-500">{fmt(d.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly trend */}
      {monthlySummary && (
        <div className="border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold">Monthly Trend</h2>
          <MonthlyTrendBars monthlySummary={monthlySummary} />
        </div>
      )}

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl"
          style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
        >
          <p className="font-semibold">
            {new Date(tooltip.day.date + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short",
            })}
          </p>
          {tooltip.day.total > 0 ? (
            <>
              <p className="text-muted-foreground">{fmt(tooltip.day.total)} · {tooltip.day.count} txn{tooltip.day.count !== 1 ? "s" : ""}</p>
              {tooltip.day.topCategory && (
                <p className="text-muted-foreground capitalize">Top: {tooltip.day.topCategory}</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No spending</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Monthly trend bar chart (pure CSS) ──────────────────────────
function MonthlyTrendBars({ monthlySummary }) {
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const entries = Object.entries(monthlySummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  if (!entries.length) return null;
  const maxVal = Math.max(...entries.map(([, v]) => v.total), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {entries.map(([month, data]) => {
        const pct = Math.round((data.total / maxVal) * 100);
        const [yr, mo] = month.split("-");
        const label = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString("en-IN", { month: "short" });
        return (
          <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 relative"
              style={{ height: `${pct}%`, minHeight: data.total > 0 ? 4 : 0 }}
            >
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-popover border border-border rounded px-2 py-1 text-[10px] shadow">
                {fmt(data.total)}
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function buildWeeks(heatmapData) {
  const weeks = [];
  let week = new Array(7).fill(null);
  for (const day of heatmapData) {
    const dow = new Date(day.date + "T00:00:00").getDay();
    if (dow === 0 && week.some(Boolean)) { weeks.push(week); week = new Array(7).fill(null); }
    week[dow] = day;
  }
  if (week.some(Boolean)) weeks.push(week);
  return weeks;
}

function buildMonthLabels(heatmapData) {
  const labels = [];
  let lastMonth = -1;
  let colIdx = 0;
  let prevColIdx = 0;
  for (const day of heatmapData) {
    const date = new Date(day.date + "T00:00:00");
    const month = date.getMonth();
    const dow = date.getDay();
    if (month !== lastMonth) {
      const gap = labels.length === 0 ? 0 : colIdx - prevColIdx;
      labels.push({ label: MONTHS[month], gap });
      prevColIdx = colIdx;
      lastMonth = month;
    }
    if (dow === 6) colIdx++;
  }
  return labels;
}

function StatCard({ label, value, capitalize }) {
  return (
    <div className="bg-muted/50 rounded-xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-bold ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}