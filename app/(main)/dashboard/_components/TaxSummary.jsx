"use client";

import { useEffect, useState, useTransition } from "react";
import { getTaxSummary } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function TaxSummary() {
  const [data, setData] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await getTaxSummary();
      setData(res);
    });
  }, []);

  if (pending || !data) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground animate-pulse">Loading tax summary…</p>
        </CardContent>
      </Card>
    );
  }

  const topExpenses = Object.entries(data.expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topIncome = Object.entries(data.incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          Tax Summary
          <span className="text-xs font-normal text-muted-foreground">FY {data.fy}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Total Income</p>
            <p className="text-sm font-bold text-emerald-600">{fmt(data.totalIncome)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Total Expenses</p>
            <p className="text-sm font-bold text-red-500">{fmt(data.totalExpenses)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Net Savings</p>
            <p className="text-sm font-bold text-blue-600">{fmt(data.netSavings)}</p>
          </div>
        </div>

        {/* Potential deductions */}
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Potential Deductions</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              Insurance, healthcare, education, savings
            </p>
          </div>
          <p className="text-base font-bold text-amber-700 dark:text-amber-300">
            {fmt(data.potentialDeductions)}
          </p>
        </div>

        {/* Top expense categories */}
        {topExpenses.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Top Expense Categories
            </p>
            <div className="space-y-2">
              {topExpenses.map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-3">
                  <p className="text-xs capitalize flex-1 text-foreground">{cat}</p>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${Math.min(100, (amt / data.totalExpenses) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold w-20 text-right">{fmt(amt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Income sources */}
        {topIncome.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Income Sources
            </p>
            <div className="space-y-2">
              {topIncome.map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <p className="text-xs capitalize text-foreground">{cat}</p>
                  <p className="text-xs font-semibold text-emerald-600">{fmt(amt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly breakdown */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Monthly Breakdown
          </p>
          <div className="space-y-1.5">
            {Object.entries(data.monthlyBreakdown).map(([month, vals]) => (
              <div key={month} className="flex items-center gap-2 text-xs">
                <span className="w-14 text-muted-foreground shrink-0">{month}</span>
                <span className="text-emerald-600 w-20 text-right">{fmt(vals.income)}</span>
                <span className="text-red-500 w-20 text-right">{fmt(vals.expenses)}</span>
                <span className={`w-20 text-right font-medium ${vals.income - vals.expenses >= 0 ? "text-blue-600" : "text-red-500"}`}>
                  {fmt(vals.income - vals.expenses)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
            <span className="w-14 shrink-0" />
            <span className="w-20 text-right">Income</span>
            <span className="w-20 text-right">Expenses</span>
            <span className="w-20 text-right">Net</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground border-t border-border pt-3">
          ⚠️ {data.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}