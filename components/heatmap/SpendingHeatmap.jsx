"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSpendingHeatmap } from "@/actions/spendingHeatmap";

const GAP            = 4;
const DAY_LABEL_W    = 32;
const MIN_CELL       = 10;
const MAX_CELL       = 22;

const LEVEL_COLORS = [
  "bg-gray-800/50",
  "bg-emerald-900",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-300",
];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseLocalDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toLocalStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildWeekGrid(heatmapData) {
  if (!heatmapData?.length) return [];

  const byDate = {};
  for (const day of heatmapData) byDate[day.date] = day;

  const first = parseLocalDate(heatmapData[0].date);
  const last  = parseLocalDate(heatmapData[heatmapData.length - 1].date);

  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(last);
  gridEnd.setDate(gridEnd.getDate() + ((6 - gridEnd.getDay() + 7) % 7));

  const weeks  = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week = [];
    for (let dow = 0; dow < 7; dow++) {
      const str = toLocalStr(cursor);
      if (cursor < first || cursor > last) {
        week.push(null);
      } else {
        week.push(byDate[str] ?? { date: str, total: 0, count: 0, level: 0, topCategory: null });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function buildMonthLabels(weeks) {
  const labels  = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    const first = week.find((d) => d !== null);
    if (!first) return;
    const month = parseLocalDate(first.date).getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTH_NAMES[month], colIndex: colIdx });
      lastMonth = month;
    }
  });
  return labels;
}

function useCellSize(containerRef, totalCols) {
  const [cellSize, setCellSize] = useState(14);

  const compute = useCallback(() => {
    if (!containerRef.current || totalCols === 0) return;
    const available = containerRef.current.getBoundingClientRect().width - DAY_LABEL_W;
    const raw = available / totalCols - GAP;
    setCellSize(Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(raw))));
  }, [containerRef, totalCols]);

  useEffect(() => {
    if (!containerRef.current) return;
    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [compute, containerRef]);

  return cellSize;
}

export default function SpendingHeatmap({ months = 12 }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const containerRef          = useRef(null);

  useEffect(() => {
    getSpendingHeatmap({ months })
      .then((res) => { if (res?.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [months]);

  const weeks       = data ? buildWeekGrid(data.heatmapData) : [];
  const monthLabels = buildMonthLabels(weeks);
  const totalCols   = weeks.length;

  const cellSize = useCellSize(containerRef, totalCols);
  const cellPx   = cellSize + GAP;

  const fmt = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (loading) return <HeatmapSkeleton />;
  if (!data)   return <p className="text-sm text-muted-foreground">No heatmap data available.</p>;

  const { thresholds, categoryTotals, totalSpend, activeDays } = data;

  return (
    <div className="bg-card border rounded-xl p-3 sm:p-5 space-y-5 shadow-sm">
      <h2 className="text-base font-semibold">Spending Activity</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Spend"  value={fmt(totalSpend)} />
        <StatCard label="Active Days"  value={`${activeDays} days`} />
        <StatCard label="Top Category" value={Object.keys(categoryTotals)[0] ?? "—"} capitalize />
      </div>

      {/* Grid */}
      <div ref={containerRef} className="w-full overflow-x-auto">

        {/* Month labels */}
        <div
          className="relative h-[18px] mb-[6px]"
          style={{ marginLeft: DAY_LABEL_W }}
        >
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={`${label}-${colIndex}`}
              className="absolute text-[11px] leading-none text-muted-foreground select-none whitespace-nowrap"
              style={{ left: colIndex * cellPx }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex">

          {/* Day labels */}
          <div
            className="flex flex-col shrink-0"
            style={{ width: DAY_LABEL_W, gap: GAP }}
          >
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className="text-[10px] leading-none text-muted-foreground text-right pr-2"
                style={{
                  height:     cellSize,
                  lineHeight: `${cellSize}px`,
                  visibility: i % 2 !== 0 ? "visible" : "hidden",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex min-w-max" style={{ gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <div
                        key={di}
                        style={{ width: cellSize, height: cellSize, flexShrink: 0 }}
                      />
                    );
                  }

                  return (
                    <div
                      key={di}
                      className={`rounded-[3px] cursor-default transition-opacity hover:opacity-70 ${LEVEL_COLORS[day.level ?? 0]}`}
                      style={{ width: cellSize, height: cellSize, flexShrink: 0 }}
                      onMouseEnter={(e) =>
                        setTooltip({ day, x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-[6px] mt-3" style={{ marginLeft: DAY_LABEL_W }}>
          <span className="text-[10px] text-muted-foreground">Less</span>
          {LEVEL_COLORS.map((cls, i) => (
            <div
              key={i}
              className={`rounded-[3px] ${cls}`}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
          {thresholds && (
            <span className="text-[10px] text-muted-foreground ml-3 tabular-nums">
              {fmt(thresholds.p25)} · {fmt(thresholds.p50)} · {fmt(thresholds.p75)}
            </span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 shadow-xl"
          style={{ left: tooltip.x + 14, top: tooltip.y - 52 }}
        >
          <p className="text-xs font-semibold mb-0.5">
            {parseLocalDate(tooltip.day.date).toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short", year: "numeric",
            })}
          </p>
          {tooltip.day.total > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                {fmt(tooltip.day.total)} · {tooltip.day.count} txn{tooltip.day.count !== 1 ? "s" : ""}
              </p>
              {tooltip.day.topCategory && (
                <p className="text-xs text-muted-foreground capitalize">{tooltip.day.topCategory}</p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No spending</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, capitalize }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-5 space-y-4 animate-pulse">
      <div className="h-4 w-36 bg-muted rounded" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
      </div>
      <div className="h-28 bg-muted rounded-lg" />
    </div>
  );
}