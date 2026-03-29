"use client";

import { useEffect, useState, useTransition } from "react";
import { getFinancialHealthScore } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLOR = {
  emerald: { ring: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  blue:    { ring: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950",        bar: "bg-blue-500",    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  amber:   { ring: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950",      bar: "bg-amber-500",   badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  red:     { ring: "text-red-500",     bg: "bg-red-50 dark:bg-red-950",          bar: "bg-red-500",     badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function FinancialHealthScore() {
  const [data, setData] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await getFinancialHealthScore();
      setData(res);
    });
  }, []);

  if (pending || !data) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground animate-pulse">Calculating your health score…</p>
        </CardContent>
      </Card>
    );
  }

  const c = COLOR[data.color] ?? COLOR.amber;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          Financial Health Score
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {data.grade}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score ring (CSS-based) */}
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
                className="text-muted/30" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke="currentColor" strokeWidth="3"
                className={c.ring}
                strokeDasharray={`${data.total} 100`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${c.ring}`}>{data.total}</span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {Object.values(data.breakdown).map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.score}/{item.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail pills */}
        <div className="grid grid-cols-2 gap-2">
          {Object.values(data.breakdown).map((item) => (
            <div key={item.label} className={`rounded-lg px-3 py-2 ${c.bg}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
              <p className="text-xs font-medium">{item.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}