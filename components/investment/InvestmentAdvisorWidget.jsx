"use client";

import { useEffect, useState, useTransition } from "react";
import { getInvestmentSummary, requestInvestmentAdvice } from "@/actions/investmentAdvisor";

const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const TYPE_COLORS = {
  "SIP - Mutual Fund": { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  "Fixed Deposit":     { bar: "bg-blue-500",    text: "text-blue-700 dark:text-blue-300" },
  "Emergency Fund":    { bar: "bg-amber-500",   text: "text-amber-700 dark:text-amber-300" },
  "Index Fund":        { bar: "bg-purple-500",  text: "text-purple-700 dark:text-purple-300" },
};

export function InvestmentAdvisorWidget() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent]       = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getInvestmentSummary()
      .then((res) => res.success && setData(res))
      .finally(() => setLoading(false));
  }, []);

  const requestAdvice = () => {
    startTransition(async () => {
      await requestInvestmentAdvice();
      setSent(true);
    });
  };

  if (loading) return <WidgetSkeleton />;
  if (!data)   return null;

  if (!data.hasSurplus) {
    return (
      <div className="rounded-xl border border-border p-4 sm:p-5">
        <p className="text-sm sm:text-base font-medium mb-1">Investment Advisor</p>
        <p className="text-xs sm:text-sm text-muted-foreground">{data.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4 sm:p-5 space-y-4 sm:space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm sm:text-base font-semibold">Investment Advisor</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This month&apos;s surplus
          </p>
        </div>
        <p className="text-lg sm:text-xl font-bold text-emerald-600">
          {fmt(data.surplus)}
        </p>
      </div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-center">
        <div className="bg-muted/50 rounded-lg py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Income
          </p>
          <p className="text-sm sm:text-base font-semibold text-emerald-600">
            {fmt(data.income)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Expenses
          </p>
          <p className="text-sm sm:text-base font-semibold text-red-500">
            {fmt(data.expenses)}
          </p>
        </div>
      </div>

      {/* Allocation bars */}
      {data.allocations?.length > 0 && (
        <div className="space-y-3">
          {data.allocations.map((alloc, i) => {
            const colors =
              TYPE_COLORS[alloc.type] || {
                bar: "bg-gray-400",
                text: "text-gray-600",
              };

            return (
              <div key={i}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs mb-1 gap-1">
                  <span className={`font-medium ${colors.text}`}>
                    {alloc.type}
                  </span>
                  <span className="text-muted-foreground">
                    {fmt(alloc.amount)} · {alloc.percentage}%
                  </span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bar}`}
                    style={{ width: `${alloc.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top tip */}
      {data.topTip && (
        <p className="text-xs sm:text-sm text-muted-foreground italic border-t border-border pt-3">
          💡 {data.topTip}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={requestAdvice}
        disabled={pending || sent}
        className="w-full text-sm sm:text-base bg-primary text-primary-foreground rounded-lg py-2.5 sm:py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {sent
          ? "✓ Full plan sent to your email"
          : pending
          ? "Sending…"
          : "Get Full Plan via Email"}
      </button>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-muted rounded w-24 sm:w-32" />
        <div className="h-5 bg-muted rounded w-16 sm:w-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="h-12 bg-muted rounded-lg" />
        <div className="h-12 bg-muted rounded-lg" />
      </div>

      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}