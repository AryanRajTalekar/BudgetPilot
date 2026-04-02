import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { InvestmentAdvisorEmail } from "@/emails/InvestmentAdvisorEmail";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────
// FEATURE 1: AI Surplus Investment Advisor
// Cron: 2nd of every month at 9 AM (after monthly report on 1st)
// On-demand: event "investment.advisor.requested"
// ─────────────────────────────────────────────────────────────────

export const investmentAdvisorMonthly = inngest.createFunction(
  {
    id: "investment-advisor-monthly",
    name: "AI Investment Advisor - Monthly",
  },
  { cron: "0 9 2 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-all-users", async () => {
      return db.user.findMany({
        select: { id: true, email: true, name: true },
      });
    });

    const results = [];
    for (const user of users) {
      const result = await step.run(`advisor-${user.id}`, () =>
        processInvestmentAdvice(user)
      );
      results.push(result);
    }

    return { processed: users.length, results };
  }
);

// On-demand: trigger from server action or after monthly report
export const investmentAdvisorOnDemand = inngest.createFunction(
  {
    id: "investment-advisor-on-demand",
    name: "AI Investment Advisor - On Demand",
  },
  { event: "investment.advisor.requested" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const user = await step.run("fetch-user", () =>
      db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      })
    );

    if (!user) return { skipped: true, reason: "user_not_found" };

    return step.run("run-advisor", () => processInvestmentAdvice(user));
  }
);

// ─── Core processor ──────────────────────────────────────────────
async function processInvestmentAdvice(user) {
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: lastMonthStart, lte: lastMonthEnd },
    },
  });

  if (!transactions.length) return { skipped: true, reason: "no_transactions" };

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const surplus = income - expenses;

  if (surplus < 1000) return { skipped: true, reason: "insufficient_surplus", surplus };

  const byCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
      return acc;
    }, {});

  const goals = await db.lifeGoal.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    select: { title: true, targetAmount: true, savedAmount: true, targetDate: true },
  });

  const advice = await generateInvestmentAdvice({ income, expenses, surplus, byCategory, goals });

  await sendEmail({
    to: user.email,
    subject: `💡 Your Investment Plan — ₹${Math.round(surplus).toLocaleString("en-IN")} Surplus`,
    react: InvestmentAdvisorEmail({
      userName: user.name,
      surplus,
      income,
      expenses,
      advice,
      month: lastMonthStart.toLocaleString("default", { month: "long", year: "numeric" }),
    }),
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "💡 Investment Plan Ready",
      message: `You have ₹${Math.round(surplus).toLocaleString("en-IN")} surplus. See your personalized investment plan.`,
      type: "AI",
    },
  });

  return { success: true, userId: user.id, surplus };
}

// ─── Gemini prompt ───────────────────────────────────────────────
async function generateInvestmentAdvice({ income, expenses, surplus, byCategory, goals }) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const goalsSummary = goals.length
    ? goals.map((g) => {
        const remaining = g.targetAmount.toNumber() - g.savedAmount.toNumber();
        const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / 86400000);
        return `"${g.title}" — ₹${Math.round(remaining)} remaining, ${daysLeft} days left`;
      }).join("; ")
    : "No active goals";

  const categoryStr = Object.entries(byCategory)
    .map(([c, a]) => `${c}: ₹${Math.round(a)}`)
    .join(", ");

  const prompt = `
You are an expert Indian personal finance advisor. Analyze and create an investment plan.

Monthly Income: ₹${Math.round(income)}
Monthly Expenses: ₹${Math.round(expenses)}
Available Surplus: ₹${Math.round(surplus)}
Risk Profile: moderate
Expense Breakdown: ${categoryStr}
Active Goals: ${goalsSummary}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence personalized summary",
  "allocations": [
    { "type": "Emergency Fund", "amount": number, "percentage": number, "reason": "one line", "action": "specific step" },
    { "type": "SIP - Mutual Fund", "amount": number, "percentage": number, "reason": "one line", "action": "specific step" },
    { "type": "Fixed Deposit", "amount": number, "percentage": number, "reason": "one line", "action": "specific step" },
    { "type": "Index Fund", "amount": number, "percentage": number, "reason": "one line", "action": "specific step" }
  ],
  "topTip": "most important advice based on spending",
  "goalNudge": "advice related to active goals"
}

Rules: amounts sum to ₹${Math.round(surplus)}, percentages sum to 100, use Indian products (SIP/FD/Nifty 50).
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(text);
  } catch {
    // Safe fallback allocation
    return {
      summary: `You have ₹${Math.round(surplus).toLocaleString("en-IN")} surplus. Here is a balanced moderate-risk plan.`,
      allocations: [
        { type: "Emergency Fund",   amount: Math.round(surplus * 0.20), percentage: 20, reason: "Safety net first", action: "Move to a high-yield savings account" },
        { type: "SIP - Mutual Fund",amount: Math.round(surplus * 0.35), percentage: 35, reason: "Long-term wealth creation", action: "Start SIP in Nifty 50 index fund" },
        { type: "Fixed Deposit",    amount: Math.round(surplus * 0.25), percentage: 25, reason: "Guaranteed 7–8% returns", action: "Open 1-year FD with SBI or HDFC" },
        { type: "Index Fund",       amount: Math.round(surplus * 0.20), percentage: 20, reason: "Market-linked growth", action: "Invest in Nifty Next 50 fund" },
      ],
      topTip: "Automate your investments on salary day to avoid lifestyle inflation.",
      goalNudge: "Allocate any windfall income directly toward your nearest goal deadline.",
    };
  }
}