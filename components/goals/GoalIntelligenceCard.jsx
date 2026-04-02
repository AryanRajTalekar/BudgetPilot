"use client";

import { useState, useTransition } from "react";
import { getGoalAINudge } from "@/actions/goalsIntelligence";
import { addFundsToGoal, deleteGoal } from "@/actions/goals";
import { toast } from "sonner";

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950", ring: "border-emerald-300" },
  ahead:     { label: "Ahead",     color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950",        ring: "border-blue-300" },
  on_track:  { label: "On Track",  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950",  ring: "border-emerald-200" },
  behind:    { label: "Behind",    color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950",      ring: "border-amber-300" },
  overdue:   { label: "Overdue",   color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950",          ring: "border-red-300" },
};

const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function GoalIntelligenceCard({ goal }) {
  const intel = goal.intelligence;
  const status = STATUS_CONFIG[intel.status] ?? STATUS_CONFIG.on_track;

  const [aiNudge, setAiNudge]       = useState(null);
  const [expanded, setExpanded]     = useState(false);
  const [showFunds, setShowFunds]   = useState(false);
  const [amount, setAmount]         = useState("");

  const [aiPending, startAiTransition]       = useTransition();
  const [fundsPending, startFundsTransition] = useTransition();

  const barColor =
    intel.status === "behind" || intel.status === "overdue"
      ? "bg-amber-500"
      : intel.status === "ahead"
      ? "bg-blue-500"
      : "bg-emerald-500";

  const fetchAiNudge = () => {
    startAiTransition(async () => {
      const res = await getGoalAINudge(goal.id);
      if (res.success) setAiNudge(res);
      setExpanded(true);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${goal.title}"?`)) return;
    startFundsTransition(async () => {
      const res = await deleteGoal(goal.id);
      if (res.success) {
        toast.success(`"${goal.title}" deleted`);
      } else {
        toast.error("Failed to delete goal");
      }
    });
  };

  const handleAddFunds = () => {
    const parsed = parseFloat(amount);

    if (!parsed || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (parsed > intel.remaining) {
      toast.error(`Amount exceeds remaining target of ${fmt(intel.remaining)}`);
      return;
    }
    if (parsed > goal.accountBalance) {
      toast.error(`Insufficient account balance (${fmt(goal.accountBalance)} available)`);
      return;
    }

    startFundsTransition(async () => {
      const res = await addFundsToGoal(goal.id, parsed);
      if (res.success) {
        toast.success(`${fmt(parsed)} added to "${goal.title}"`);
        setAmount("");
        setShowFunds(false);
      } else {
        toast.error(res.error || "Something went wrong");
      }
    });
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${status.ring}`}>

      {/* Header */}
      <div className={`px-4 py-3 ${status.bg} flex flex-wrap items-start gap-2 justify-between`}>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{goal.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target: {fmt(goal.targetAmount)} · {intel.daysRemaining} days left
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
          <button
            onClick={handleDelete}
            disabled={fundsPending}
            className="text-muted-foreground hover:text-destructive transition-colors text-xs disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{fmt(goal.savedAmount)} saved</span>
          <span>{intel.progressPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, intel.progressPct)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <GoalMiniStat label="Daily pace" value={`${fmt(intel.dailyVelocity)}/day`} />
        <GoalMiniStat label="Need/month" value={fmt(intel.monthlySavingNeeded)} />
        <GoalMiniStat label="Remaining" value={fmt(intel.remaining)} />
      </div>

      {/* Nudge */}
      <div className="px-4 pb-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{intel.nudge}</p>
      </div>

      {/* Add Funds */}
      {intel.status !== "completed" && (
        <div className="px-4 pb-3">
          {!showFunds ? (
            <button
              onClick={() => setShowFunds(true)}
              className="w-full text-xs border border-border rounded-lg py-2 hover:bg-muted transition-colors font-medium"
            >
              + Add Funds
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFunds()}
                  className="w-full pl-6 pr-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                  disabled={fundsPending}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddFunds}
                  disabled={fundsPending || !amount}
                  className="flex-1 text-xs bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:opacity-90 disabled:opacity-50"
                >
                  {fundsPending ? "Saving…" : "Confirm"}
                </button>
                <button
                  onClick={() => { setShowFunds(false); setAmount(""); }}
                  disabled={fundsPending}
                  className="text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showFunds && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Available: {fmt(goal.accountBalance)}
            </p>
          )}
        </div>
      )}

      {/* AI */}
      {!expanded && intel.status !== "completed" && (
        <div className="px-4 pb-4">
          <button
            onClick={fetchAiNudge}
            disabled={aiPending}
            className="w-full text-xs border border-border rounded-lg py-2 hover:bg-muted disabled:opacity-50"
          >
            {aiPending ? "Analyzing…" : "Get AI Advice"}
          </button>
        </div>
      )}

      {expanded && aiNudge && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <p className="text-sm font-medium">{aiNudge.headline}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{aiNudge.advice}</p>

          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase">Quick Win</p>
            <p className="text-xs">{aiNudge.quickWin}</p>
          </div>

          <p className="text-xs italic text-muted-foreground">{aiNudge.motivation}</p>

          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-muted-foreground underline"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}

export function GoalSummaryBadge({ goal }) {
  const intel = goal.intelligence;
  const status = STATUS_CONFIG[intel.status] ?? STATUS_CONFIG.on_track;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{goal.title}</p>
        <p className="text-xs text-muted-foreground truncate">{intel.nudge}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
        <p className="text-xs text-muted-foreground">{intel.progressPct}%</p>
      </div>
    </div>
  );
}

function GoalMiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold mt-0.5 truncate">{value}</p>
    </div>
  );
}