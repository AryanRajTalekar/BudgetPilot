// No "use server" directive — pure utility functions

export function computeGoalIntelligence(goal) {
  const now = new Date();
  const createdAt = new Date(goal.createdAt);
  const targetDate = new Date(goal.targetDate);

  const totalDays = Math.ceil((targetDate - createdAt) / 86400000);
  const daysElapsed = Math.ceil((now - createdAt) / 86400000);
  const daysRemaining = Math.max(0, Math.ceil((targetDate - now) / 86400000));

  const remaining = goal.targetAmount - goal.savedAmount;
  const progressPct = goal.targetAmount > 0
    ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
    : 0;

  const expectedPct = totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;
  const expectedSaved = (expectedPct / 100) * goal.targetAmount;

  const dailyVelocity = daysElapsed > 0 ? goal.savedAmount / daysElapsed : 0;

  const projectedDaysToComplete = dailyVelocity > 0 ? Math.ceil(remaining / dailyVelocity) : Infinity;
  const projectedCompletionDate = dailyVelocity > 0
    ? new Date(now.getTime() + projectedDaysToComplete * 86400000)
    : null;

  const requiredDailyFromToday = daysRemaining > 0 ? remaining / daysRemaining : Infinity;

  const savedVsExpected = goal.savedAmount - expectedSaved;
  const daysAheadBehind = dailyVelocity > 0 ? Math.round(savedVsExpected / dailyVelocity) : 0;

  let status;
  if (progressPct >= 100) {
    status = "completed";
  } else if (daysRemaining === 0) {
    status = "overdue";
  } else if (daysAheadBehind >= 7) {
    status = "ahead";
  } else if (daysAheadBehind <= -7) {
    status = "behind";
  } else {
    status = "on_track";
  }

  const monthlySavingNeeded = daysRemaining > 0
    ? Math.ceil(remaining / (daysRemaining / 30))
    : 0;

  const nudge = buildNudge({
    status,
    daysAheadBehind,
    daysRemaining,
    remaining,
    monthlySavingNeeded,
    dailyVelocity,
    progressPct,
    projectedCompletionDate,
    targetDate: new Date(goal.targetDate),
  });

  return {
    progressPct: Math.round(progressPct * 10) / 10,
    daysRemaining,
    daysElapsed,
    dailyVelocity: Math.round(dailyVelocity),
    projectedCompletionDate,
    daysAheadBehind,
    status,
    remaining: Math.round(remaining),
    monthlySavingNeeded,
    requiredDailyFromToday: Math.round(requiredDailyFromToday),
    nudge,
  };
}

// Kept in same file so computeGoalIntelligence can access it
function buildNudge({ status, daysAheadBehind, daysRemaining, remaining, monthlySavingNeeded, progressPct, projectedCompletionDate, targetDate }) {
  if (progressPct >= 100) return "🎉 Goal achieved! Time to set your next milestone.";

  if (status === "overdue") {
    return `⏰ This goal is overdue. You still need ₹${Math.round(remaining).toLocaleString("en-IN")}. Consider extending the deadline or boosting savings.`;
  }

  if (status === "ahead") {
    const daysStr = Math.abs(daysAheadBehind);
    if (projectedCompletionDate && projectedCompletionDate < targetDate) {
      const earlyDays = Math.ceil((targetDate - projectedCompletionDate) / 86400000);
      return `🚀 You're ${daysStr} days ahead of schedule! At this pace, you'll hit your goal ${earlyDays} days early.`;
    }
    return `✅ You're ${daysStr} days ahead of schedule. Keep it up!`;
  }

  if (status === "behind") {
    const catchUpMonthly = Math.ceil(monthlySavingNeeded);
    return `📈 You're ${Math.abs(daysAheadBehind)} days behind. Save ₹${catchUpMonthly.toLocaleString("en-IN")}/month (₹${Math.round(remaining / daysRemaining * 30 * 100 / 100).toLocaleString("en-IN")} total needed by deadline).`;
  }

  if (daysRemaining <= 30) {
    return `🏁 Final stretch! ₹${Math.round(remaining).toLocaleString("en-IN")} to go in ${daysRemaining} days.`;
  }

  return `📊 On track. Save ₹${monthlySavingNeeded.toLocaleString("en-IN")}/month to meet your deadline.`;
}