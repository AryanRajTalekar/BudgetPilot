import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyDigestEmail } from "@/emails/WeeklyDigestEmail";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────
// FEATURE 2A: Weekly Finance Digest
// Cron: every Sunday at 8 AM
// ─────────────────────────────────────────────────────────────────

export const weeklyFinanceDigest = inngest.createFunction(
  {
    id: "weekly-finance-digest",
    name: "Weekly Finance Digest",
  },
  { cron: "0 8 * * 0" }, // Every Sunday 8 AM
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        select: { id: true, email: true, name: true },
      });
    });

    const results = [];
    for (const user of users) {
      const result = await step.run(`digest-${user.id}`, () =>
        sendWeeklyDigest(user)
      );
      results.push(result);
    }

    return { processed: users.length };
  }
);

async function sendWeeklyDigest(user) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: weekStart, lte: now },
    },
    orderBy: { date: "desc" },
  });

  if (!transactions.length) return { skipped: true, reason: "no_transactions" };

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const byCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
      return acc;
    }, {});

  // Get current month budget for context
  const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budget = await db.budget.findUnique({
    where: { userId_month: { userId: user.id, month: monthString } },
  });

  const geminiInsights = await generateWeeklyInsights({
    income,
    expenses,
    byCategory,
    budgetAmount: budget?.amount?.toNumber() ?? 0,
    budgetSpent: budget?.spent?.toNumber() ?? 0,
    transactionCount: transactions.length,
  });

  await sendEmail({
    to: user.email,
    subject: `📊 Your Weekly Finance Digest — ${formatDateRange(weekStart, now)}`,
    react: WeeklyDigestEmail({
      userName: user.name,
      weekStart,
      weekEnd: now,
      income,
      expenses,
      byCategory,
      insights: geminiInsights,
      recentTransactions: transactions.slice(0, 5),
      budget: budget ? { amount: budget.amount.toNumber(), spent: budget.spent.toNumber() } : null,
    }),
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "📊 Weekly Digest Sent",
      message: `Your weekly finance summary for ${formatDateRange(weekStart, now)} is in your inbox.`,
      type: "WEEKLY_DIGEST",
    },
  });

  return { success: true, userId: user.id };
}

async function generateWeeklyInsights({ income, expenses, byCategory, budgetAmount, budgetSpent, transactionCount }) {
  const model = genAI.getGenerativeModel({model: "gemini-flash-latest" });

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => `${cat}: ₹${Math.round(amt)}`)
    .join(", ");

  const budgetUsed = budgetAmount > 0 ? ((budgetSpent / budgetAmount) * 100).toFixed(1) : "N/A";

  const prompt = `
Analyze this week's spending and provide 3 short, friendly, actionable insights.

This week:
- Income: ₹${Math.round(income)}
- Expenses: ₹${Math.round(expenses)}
- Net: ₹${Math.round(income - expenses)}
- Transactions: ${transactionCount}
- Top categories: ${topCategories}
- Monthly budget used so far: ${budgetUsed}%

Return ONLY valid JSON:
{
  "summary": "1 friendly sentence about this week overall",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "overspendingAlert": "category name if one category is unusually high, else null",
  "savingsSuggestion": "one specific saving tip for next week"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(text);
  } catch {
    return {
      summary: `You spent ₹${Math.round(expenses)} across ${transactionCount} transactions this week.`,
      insights: [
        "Review your top spending category for potential savings.",
        "Try to keep daily spending below your weekly average.",
        "Set a specific budget for discretionary categories.",
      ],
      overspendingAlert: null,
      savingsSuggestion: "Pack lunch twice next week to save on food expenses.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// FEATURE 2B: Enhanced Budget Alerts (Predictive + Spike Detection)
// Extends the existing checkBudgetAlerts — runs daily
// ─────────────────────────────────────────────────────────────────

export const enhancedBudgetAlerts = inngest.createFunction(
  {
    id: "enhanced-budget-alerts",
    name: "Enhanced Budget Alerts - Predictive",
  },
  { cron: "0 20 * * *" }, // Every day at 8 PM
  async ({ step }) => {
    const now = new Date();
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const budgets = await step.run("fetch-budgets", async () => {
      const raw = await db.budget.findMany({
        where: { month: monthString },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });
      return raw.map((b) => ({
        ...b,
        amount: b.amount.toNumber(),
        spent: b.spent.toNumber(),
      }));
    });

    for (const budget of budgets) {
      await step.run(`enhanced-alert-${budget.id}`, () =>
        runEnhancedAlerts(budget, now, monthString)
      );
    }

    return { processed: budgets.length };
  }
);

async function runEnhancedAlerts(budget, now, monthString) {
  if (budget.amount === 0) return { skipped: true };

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  // Daily burn rate
  const dailyBurnRate = budget.spent / dayOfMonth;
  const projectedMonthlySpend = dailyBurnRate * daysInMonth;
  const projectedOverspend = projectedMonthlySpend - budget.amount;
  // const currentPercentage = (budget.spent / budget.amount) * 100;

  // Fetch this week's transactions for spike detection
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const recentTransactions = await db.transaction.findMany({
    where: {
      userId: budget.userId,
      type: "EXPENSE",
      date: { gte: weekStart, lte: now },
    },
  });

  const weeklyTotal = recentTransactions.reduce((s, t) => s + t.amount.toNumber(), 0);
  const expectedWeeklySpend = (budget.amount / 4); // quarter of monthly budget
  const isSpikingThisWeek = weeklyTotal > expectedWeeklySpend * 1.5;

  // Predictive alert: on track to overspend by > 10%
  if (projectedOverspend > budget.amount * 0.1 && daysRemaining > 5) {
    const alreadyAlerted = await db.notification.findFirst({
      where: {
        userId: budget.userId,
        type: "PREDICTIVE_ALERT",
        createdAt: { gte: startOfMonth },
      },
    });

    if (!alreadyAlerted) {
      const message = `At your current pace, you'll overspend by ₹${Math.round(projectedOverspend).toLocaleString("en-IN")} this month. Cut ₹${Math.round(dailyBurnRate * 0.2).toLocaleString("en-IN")}/day to stay on track.`;

      await db.notification.create({
        data: {
          userId: budget.userId,
          title: "⚡ Predictive Budget Alert",
          message,
          type: "PREDICTIVE_ALERT",
        },
      });
    }
  }

  // Spike detection: spending 50% above normal this week
  if (isSpikingThisWeek) {
    const topCategory = recentTransactions.reduce((acc, t) => {
      const cat = t.category;
      acc[cat] = (acc[cat] || 0) + t.amount.toNumber();
      return acc;
    }, {});
    const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];

    const alreadyAlerted = await db.notification.findFirst({
      where: {
        userId: budget.userId,
        type: "SPIKE_ALERT",
        createdAt: { gte: weekStart },
      },
    });

    if (!alreadyAlerted) {
      await db.notification.create({
        data: {
          userId: budget.userId,
          title: "📈 Spending Spike Detected",
          message: `Your spending this week (₹${Math.round(weeklyTotal).toLocaleString("en-IN")}) is 50% above normal. Highest: ${topCat ? `${topCat[0]} (₹${Math.round(topCat[1]).toLocaleString("en-IN")})` : "various categories"}.`,
          type: "SPIKE_ALERT",
        },
      });
    }
  }

  return { success: true, projectedOverspend, isSpikingThisWeek };
}

// ─── Helpers ─────────────────────────────────────────────────────
function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", opts)}`;
}