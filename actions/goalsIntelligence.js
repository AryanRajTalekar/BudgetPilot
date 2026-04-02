"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { computeGoalIntelligence } from "@/lib/goalUtils";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────
// FEATURE 3: Financial Goals Intelligence
// Enhances existing getUserLifeGoals with velocity, status, AI nudges
// ─────────────────────────────────────────────────────────────────

const serializeGoal = (goal) => ({
  ...goal,
  targetAmount: goal.targetAmount.toNumber(),
  savedAmount: goal.savedAmount.toNumber(),
});

// Drop-in replacement for getUserLifeGoals — adds intelligence layer
export async function getGoalsWithIntelligence() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const goals = await db.lifeGoal.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  if (!goals.length) return [];

  const enriched = goals.map((goal) => {
    const { account, ...goalWithoutAccount } = goal;
const g = {
  ...serializeGoal(goalWithoutAccount),
  accountBalance: account.balance.toNumber(),
};

    const intelligence = computeGoalIntelligence(g);
    return { ...g, intelligence };
  });

  return enriched;
}

// Compute goal velocity and status without AI (instant, no latency)



// AI-powered deep nudge (call separately, async, for detailed advice)
export async function getGoalAINudge(goalId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const goal = await db.lifeGoal.findUnique({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const g = serializeGoal(goal);
  const intel = computeGoalIntelligence(g);

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
You are a personal finance coach. Analyze this savings goal and give personalized advice.

Goal: "${goal.title}"
Target: ₹${g.targetAmount.toLocaleString("en-IN")}
Saved: ₹${g.savedAmount.toLocaleString("en-IN")} (${intel.progressPct}%)
Days remaining: ${intel.daysRemaining}
Daily saving velocity: ₹${intel.dailyVelocity}/day
Status: ${intel.status}
Days ahead/behind: ${intel.daysAheadBehind > 0 ? `${intel.daysAheadBehind} ahead` : `${Math.abs(intel.daysAheadBehind)} behind`}
Monthly saving needed: ₹${intel.monthlySavingNeeded}

Return ONLY valid JSON:
{
  "headline": "one punchy sentence about their progress",
  "advice": "2-3 sentence specific, actionable advice",
  "quickWin": "one specific thing they can do this week to accelerate progress",
  "motivation": "one motivational sentence tailored to their goal title"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    return { success: true, ...JSON.parse(text), intelligence: intel };
  } catch {
    return {
      success: true,
      headline: intel.nudge,
      advice: `You need ₹${intel.monthlySavingNeeded.toLocaleString("en-IN")} per month. Set up an auto-transfer on salary day.`,
      quickWin: "Review subscriptions today — cancel one unused service.",
      motivation: `Every rupee saved brings "${goal.title}" closer to reality.`,
      intelligence: intel,
    };
  }
}

// Update saved amount for a goal (extend existing life goals action)
export async function updateGoalSavedAmount(goalId, savedAmount) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const goal = await db.lifeGoal.findUnique({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const updated = await db.lifeGoal.update({
    where: { id: goalId },
    data: {
      savedAmount,
      status: savedAmount >= goal.targetAmount.toNumber() ? "COMPLETED" : "ACTIVE",
    },
  });

  if (savedAmount >= goal.targetAmount.toNumber()) {
    await db.notification.create({
      data: {
        userId: user.id,
        title: "🎉 Goal Achieved!",
        message: `Congratulations! You've reached your goal: "${goal.title}"`,
        type: "GOAL_ACHIEVED",
      },
    });
  } else {
    const intel = computeGoalIntelligence({ ...serializeGoal(updated) });
    if (intel.status === "behind") {
      await db.notification.create({
        data: {
          userId: user.id,
          title: "📈 Goal Behind Schedule",
          message: intel.nudge,
          type: "GOAL_NUDGE",
        },
      });
    }
  }

  revalidatePath("/goals");
  return { success: true, data: serializeGoal(updated) };
}