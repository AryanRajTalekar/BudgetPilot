"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ─── shared auth helper ───────────────────────────────────────────
async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

// ─────────────────────────────────────────────────────────────────
// FINANCIAL HEALTH SCORE
// ─────────────────────────────────────────────────────────────────
export async function getFinancialHealthScore() {
  const user = await getUser();

  const now = new Date();
  const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch everything in parallel
  const [transactions, budget, goals, emis] = await Promise.all([
    db.transaction.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    db.budget.findFirst({
      where: { userId: user.id, month: monthString },
    }),
    db.lifeGoal.findMany({
      where: { userId: user.id },
    }),
    db.emiLoan.findMany({
      where: { userId: user.id, status: "ACTIVE" },
    }),
  ]);

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  // 1. Savings rate (30 pts) — 20%+ savings rate = full score
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  const savingsScore = Math.min(30, Math.round((savingsRate / 0.2) * 30));

  // 2. Budget adherence (25 pts) — staying under budget = full score
  let budgetScore = 15; // neutral if no budget set
  if (budget && budget.amount.toNumber() > 0) {
    const pct = budget.spent.toNumber() / budget.amount.toNumber();
    budgetScore = pct <= 1 ? Math.round((1 - pct) * 25) + 10 : 0;
    budgetScore = Math.min(25, Math.max(0, budgetScore));
  }

  // 3. Goal progress (25 pts) — average progress across active goals
  let goalScore = 12; // neutral if no goals
  if (goals.length > 0) {
    const activeGoals = goals.filter((g) => g.status === "ACTIVE");
    if (activeGoals.length > 0) {
      const avgProgress =
        activeGoals.reduce((s, g) => {
          const pct = g.targetAmount.toNumber() > 0
            ? g.savedAmount.toNumber() / g.targetAmount.toNumber()
            : 0;
          return s + Math.min(1, pct);
        }, 0) / activeGoals.length;
      goalScore = Math.round(avgProgress * 25);
    }
    const completed = goals.filter((g) => g.status === "COMPLETED").length;
    goalScore = Math.min(25, goalScore + completed * 3);
  }

  // 4. EMI burden (20 pts) — EMI < 30% of income = full score
  let emiScore = 20; // full score if no EMIs
  if (emis.length > 0 && income > 0) {
    const totalEmi = emis.reduce((s, e) => s + e.emiAmount.toNumber(), 0);
    const emiRatio = totalEmi / income;
    emiScore = emiRatio <= 0.3
      ? Math.round((1 - emiRatio / 0.3) * 20)
      : 0;
    emiScore = Math.min(20, Math.max(0, emiScore));
  }

  const total = savingsScore + budgetScore + goalScore + emiScore;

  const grade =
    total >= 85 ? "Excellent" :
    total >= 70 ? "Good" :
    total >= 50 ? "Fair" :
    "Needs Work";

  const color =
    total >= 85 ? "emerald" :
    total >= 70 ? "blue" :
    total >= 50 ? "amber" :
    "red";

  return {
    total,
    grade,
    color,
    breakdown: {
      savings: { score: savingsScore, max: 30, label: "Savings rate", detail: `${Math.round(savingsRate * 100)}% of income saved` },
      budget:  { score: budgetScore,  max: 25, label: "Budget adherence", detail: budget ? `₹${Math.round(budget.spent.toNumber()).toLocaleString("en-IN")} of ₹${Math.round(budget.amount.toNumber()).toLocaleString("en-IN")} used` : "No budget set" },
      goals:   { score: goalScore,    max: 25, label: "Goal progress", detail: `${goals.filter(g => g.status === "ACTIVE").length} active, ${goals.filter(g => g.status === "COMPLETED").length} completed` },
      emi:     { score: emiScore,     max: 20, label: "EMI burden", detail: emis.length > 0 ? `${emis.length} active loan${emis.length > 1 ? "s" : ""}` : "No active loans" },
    },
    meta: { income, expenses, savingsRate, month: monthString },
  };
}

// ─────────────────────────────────────────────────────────────────
// EXPORT DATA (for CSV/PDF — returns raw data, client does the file)
// ─────────────────────────────────────────────────────────────────
export async function getExportData({ months = 3 } = {}) {
  const user = await getUser();

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: since } },
    include: { account: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => ({
    date: t.date.toISOString().split("T")[0],
    description: t.description || "",
    category: t.category,
    type: t.type,
    amount: t.amount.toNumber(),
    account: t.account.name,
    status: t.status,
  }));
}

// ─────────────────────────────────────────────────────────────────
// TAX SUMMARY (Indian FY: April–March)
// ─────────────────────────────────────────────────────────────────
export async function getTaxSummary() {
  const user = await getUser();

  const now = new Date();
  // Current FY: if month >= April (3), FY started this year, else last year
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyStart = new Date(fyStartYear, 3, 1);       // April 1
  const fyEnd   = new Date(fyStartYear + 1, 2, 31);  // March 31

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: fyStart, lte: fyEnd } },
    orderBy: { date: "asc" },
  });

  const income = transactions.filter((t) => t.type === "INCOME");
  const expenses = transactions.filter((t) => t.type === "EXPENSE");

  const totalIncome   = income.reduce((s, t) => s + t.amount.toNumber(), 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount.toNumber(), 0);

  // Income by category
  const incomeByCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
    return acc;
  }, {});

  // Expenses by category
  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
    return acc;
  }, {});

  // Potentially tax-deductible categories (80C, 80D etc)
  const deductibleCategories = ["insurance", "healthcare", "education", "savings"];
  const potentialDeductions = expenses
    .filter((t) => deductibleCategories.includes(t.category?.toLowerCase()))
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  // Monthly breakdown
  const monthlyBreakdown = {};
  for (let m = 0; m < 12; m++) {
    const d = new Date(fyStartYear, 3 + m, 1);
    if (d > now) break;
    const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthlyBreakdown[key] = { income: 0, expenses: 0 };
  }

  transactions.forEach((t) => {
    const key = new Date(t.date).toLocaleString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyBreakdown[key]) return;
    if (t.type === "INCOME") monthlyBreakdown[key].income += t.amount.toNumber();
    else monthlyBreakdown[key].expenses += t.amount.toNumber();
  });

  return {
    fy: `${fyStartYear}–${fyStartYear + 1}`,
    fyStart: fyStart.toISOString(),
    fyEnd: fyEnd.toISOString(),
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    potentialDeductions,
    incomeByCategory,
    expensesByCategory,
    monthlyBreakdown,
    transactionCount: transactions.length,
    disclaimer: "This is an estimate based on your recorded transactions. Consult a CA for actual ITR filing.",
  };
}