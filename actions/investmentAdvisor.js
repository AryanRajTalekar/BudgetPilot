"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────
// FEATURE 1: Server Actions — Investment Advisor
// ─────────────────────────────────────────────────────────────────

// Trigger on-demand for current logged-in user
export async function requestInvestmentAdvice() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  await inngest.send({
    name: "investment.advisor.requested",
    data: { userId: user.id },
  });

  return { success: true, message: "Investment advice is being generated. Check your email shortly." };
}

// Get investment summary inline (no email — for dashboard widget)
export async function getInvestmentSummary() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount.toNumber(), 0);

  const surplus = income - expenses;


  if (surplus < 1000) {
    return {
      success: true,
      hasSurplus: false,
      surplus,
      message: surplus <= 0
        ? "Your expenses exceeded income this month. Focus on reducing spending."
        : "Surplus is below ₹1,000. Keep saving to unlock investment advice.",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
User has ₹${Math.round(surplus)} surplus this month (income ₹${Math.round(income)}, expenses ₹${Math.round(expenses)}).
Give a quick 3-allocation split for moderate risk Indian investor.
Return ONLY JSON:
{
  "allocations": [
    { "type": string, "amount": number, "percentage": number },
    { "type": string, "amount": number, "percentage": number },
    { "type": string, "amount": number, "percentage": number }
  ],
  "topTip": string
}
Allocations must sum to ₹${Math.round(surplus)}.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    const data = JSON.parse(text);

    return { success: true, hasSurplus: true, surplus, income, expenses, ...data };
  } catch {
    return {
      success: true,
      hasSurplus: true,
      surplus,
      income,
      expenses,
      allocations: [
        { type: "SIP - Mutual Fund", amount: Math.round(surplus * 0.5), percentage: 50 },
        { type: "Fixed Deposit",     amount: Math.round(surplus * 0.3), percentage: 30 },
        { type: "Emergency Fund",    amount: Math.round(surplus * 0.2), percentage: 20 },
      ],
      topTip: "Invest before spending — automate on salary day.",
    };
  }
}