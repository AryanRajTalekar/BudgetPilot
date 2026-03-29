"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────
// FEATURE 4: Spending Heatmap Calendar
// Returns daily aggregated spend for GitHub-style calendar UI
// ─────────────────────────────────────────────────────────────────

// Get spending heatmap for a date range (defaults to last 12 months)
export async function getSpendingHeatmap({ months = 12 } = {}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: startDate, lte: now },
    },
    select: {
      date: true,
      amount: true,
      category: true,
    },
    orderBy: { date: "asc" },
  });

  // Aggregate by date string "YYYY-MM-DD"
  const dailyMap = {};
  const categoryMap = {};

  for (const t of transactions) {
    const dateKey = new Date(t.date).toISOString().slice(0, 10);
    const amount = t.amount.toNumber();

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { total: 0, count: 0, categories: {} };
    }
    dailyMap[dateKey].total += amount;
    dailyMap[dateKey].count += 1;
    dailyMap[dateKey].categories[t.category] =
      (dailyMap[dateKey].categories[t.category] || 0) + amount;

    // Global category totals
    categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
  }

  // Build sorted array of all days in range (fill 0 for missing days)
  const days = [];
  const cursor = new Date(startDate);
  while (cursor <= now) {
    const key = cursor.toISOString().slice(0, 10);
    const dayData = dailyMap[key];
    days.push({
      date: key,
      total: dayData ? Math.round(dayData.total) : 0,
      count: dayData ? dayData.count : 0,
      topCategory: dayData
        ? Object.entries(dayData.categories).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
        : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Compute intensity thresholds for heatmap coloring
  const nonZeroTotals = days.filter((d) => d.total > 0).map((d) => d.total);
  const maxSpend = nonZeroTotals.length ? Math.max(...nonZeroTotals) : 0;
  const p25 = percentile(nonZeroTotals, 25);
  const p50 = percentile(nonZeroTotals, 50);
  const p75 = percentile(nonZeroTotals, 75);

  // Add intensity level 0–4 to each day (GitHub-style)
  const heatmapData = days.map((d) => ({
    ...d,
    level: getIntensityLevel(d.total, p25, p50, p75, maxSpend),
  }));

  // Monthly summaries
  const monthlySummary = {};
  for (const d of days) {
    const monthKey = d.date.slice(0, 7); // "YYYY-MM"
    if (!monthlySummary[monthKey]) monthlySummary[monthKey] = { total: 0, count: 0 };
    monthlySummary[monthKey].total += d.total;
    monthlySummary[monthKey].count += d.count;
  }

  // Top spending days
  const topDays = [...days]
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    success: true,
    data: {
      heatmapData,
      maxSpend,
      thresholds: { p25: Math.round(p25), p50: Math.round(p50), p75: Math.round(p75) },
      monthlySummary,
      topDays,
      categoryTotals: Object.fromEntries(
        Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => [k, Math.round(v)])
      ),
      totalDays: days.length,
      activeDays: nonZeroTotals.length,
      totalSpend: Math.round(nonZeroTotals.reduce((s, v) => s + v, 0)),
    },
  };
}

// Get heatmap for a specific account
export async function getAccountSpendingHeatmap(accountId, { months = 12 } = {}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      accountId,
      type: "EXPENSE",
      date: { gte: startDate, lte: now },
    },
    select: { date: true, amount: true, category: true },
    orderBy: { date: "asc" },
  });

  const dailyMap = {};
  for (const t of transactions) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    dailyMap[key] = (dailyMap[key] || 0) + t.amount.toNumber();
  }

  const result = Object.entries(dailyMap).map(([date, total]) => ({
    date,
    total: Math.round(total),
  }));

  return { success: true, data: result };
}

// ─── Helpers ─────────────────────────────────────────────────────  
function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function getIntensityLevel(total, p25, p50, p75, max) {
  if (total === 0) return 0;
  if (total <= p25) return 1;
  if (total <= p50) return 2;
  if (total <= p75) return 3;
  return 4;
}