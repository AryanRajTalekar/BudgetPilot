// ─────────────────────────────────────────────────────────────────
// lib/notificationTypes.js
//
// Centralised notification type constants used across all features.
// The existing `type` field in the Notification model is a String,
// so no schema change is needed — just add these constants.
//
// Usage: import { NOTIF } from "@/lib/notificationTypes";
//        await db.notification.create({ data: { type: NOTIF.AI } })
// ─────────────────────────────────────────────────────────────────

export const NOTIF = {
  // ── Existing (keep using as-is) ──────────────────────────────
  BUDGET_ALERT:    "BUDGET_ALERT",
  MONTHLY_REPORT:  "MONTHLY_REPORT",
  RECURRING:       "RECURRING",
  IMPORT:          "IMPORT",
  ALERT:           "ALERT",
  SYSTEM:          "SYSTEM",
  INCOME:          "INCOME",
  UPDATE:          "UPDATE",

  // ── NEW: Feature 1 — Investment Advisor ──────────────────────
  AI:              "AI",              // Gemini-generated advice

  // ── NEW: Feature 2 — Weekly Digest + Enhanced Alerts ─────────
  WEEKLY_DIGEST:   "WEEKLY_DIGEST",   // Sunday weekly email sent
  PREDICTIVE_ALERT:"PREDICTIVE_ALERT",// On track to overspend
  SPIKE_ALERT:     "SPIKE_ALERT",     // Weekly spend spike detected

  // ── NEW: Feature 3 — Goals Intelligence ──────────────────────
  GOAL_ACHIEVED:   "GOAL_ACHIEVED",   // Goal completed
  GOAL_NUDGE:      "GOAL_NUDGE",      // Behind schedule warning

  // ── NEW: Feature 5 — EMI Tracker ─────────────────────────────
  LOAN_ADDED:      "LOAN_ADDED",      // New loan created
  LOAN_COMPLETED:  "LOAN_COMPLETED",  // All EMIs paid off
};

// Notification display config (for in-app notification centre UI)
export const NOTIF_CONFIG = {
  [NOTIF.BUDGET_ALERT]:     { emoji: "⚠️", label: "Budget Alert",        color: "text-amber-600"  },
  [NOTIF.MONTHLY_REPORT]:   { emoji: "📊", label: "Monthly Report",       color: "text-blue-600"   },
  [NOTIF.RECURRING]:        { emoji: "🔁", label: "Recurring",            color: "text-purple-600" },
  [NOTIF.IMPORT]:           { emoji: "📥", label: "Import",               color: "text-gray-600"   },
  [NOTIF.ALERT]:            { emoji: "💸", label: "Alert",                color: "text-red-600"    },
  [NOTIF.SYSTEM]:           { emoji: "🎉", label: "System",               color: "text-emerald-600"},
  [NOTIF.INCOME]:           { emoji: "💰", label: "Income",               color: "text-emerald-600"},
  [NOTIF.UPDATE]:           { emoji: "✏️", label: "Update",               color: "text-gray-600"   },
  [NOTIF.AI]:               { emoji: "💡", label: "AI Insight",           color: "text-indigo-600" },
  [NOTIF.WEEKLY_DIGEST]:    { emoji: "📊", label: "Weekly Digest",        color: "text-blue-600"   },
  [NOTIF.PREDICTIVE_ALERT]: { emoji: "⚡", label: "Predictive Alert",     color: "text-orange-600" },
  [NOTIF.SPIKE_ALERT]:      { emoji: "📈", label: "Spending Spike",       color: "text-red-600"    },
  [NOTIF.GOAL_ACHIEVED]:    { emoji: "🎉", label: "Goal Achieved",        color: "text-emerald-600"},
  [NOTIF.GOAL_NUDGE]:       { emoji: "📈", label: "Goal Behind",          color: "text-amber-600"  },
  [NOTIF.LOAN_ADDED]:       { emoji: "🏦", label: "Loan Added",           color: "text-blue-600"   },
  [NOTIF.LOAN_COMPLETED]:   { emoji: "🎉", label: "Loan Paid Off",        color: "text-emerald-600"},
};