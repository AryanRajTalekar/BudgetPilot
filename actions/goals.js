"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/* ------------------------------------------------ */
/* GET ALL GOALS */
/* ------------------------------------------------ */

export async function getGoals() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const goals = await db.lifeGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      ...goal,
      targetAmount: goal.targetAmount.toNumber(),
      savedAmount: goal.savedAmount.toNumber(),
    }));
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }
}

/* ------------------------------------------------ */
/* CREATE GOAL */
/* ------------------------------------------------ */

export async function createGoal(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const { title, description, targetAmount, targetDate, accountId } = data;

    const goal = await db.lifeGoal.create({
      data: {
        title,
        description,
        targetAmount,
        targetDate: new Date(targetDate),
        accountId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...goal,
        targetAmount: goal.targetAmount.toNumber(),
        savedAmount: goal.savedAmount?.toNumber() || 0,
      },
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: error.message };
  }
}

/* ------------------------------------------------ */
/* UPDATE GOAL TARGET */
/* ------------------------------------------------ */

export async function updateGoal(goalId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const goal = await db.lifeGoal.update({
      where: {
        id: goalId,
      },
      data: {
        title: data.title,
        targetAmount: data.targetAmount,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...goal,
        targetAmount: goal.targetAmount.toNumber(),
        savedAmount: goal.savedAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error updating goal:", error);
    return { success: false, error: error.message };
  }
}

/* ------------------------------------------------ */
/* DELETE GOAL */
/* ------------------------------------------------ */

export async function deleteGoal(goalId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    await db.lifeGoal.delete({
      where: {
        id: goalId,
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: error.message };
  }
}

/* ------------------------------------------------ */
/* ADD FUNDS TO GOAL */
/* ------------------------------------------------ */

export async function addFundsToGoal(goalId, amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const goal = await db.lifeGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) throw new Error("Goal not found");

    const updatedGoal = await db.$transaction(async (tx) => {
  // 1️⃣ Update goal
  const goalUpdate = await tx.lifeGoal.update({
    where: { id: goalId },
    data: {
      savedAmount: {
        increment: amount,
      },
    },
  });

  // 2️⃣ Reduce account balance
  await tx.account.update({
    where: { id: goal.accountId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  // 3️⃣ Create transaction (IMPORTANT: use lowercase category)
  await tx.transaction.create({
    data: {
      type: "EXPENSE",
      amount,
      description: `Contribution to goal: ${goal.title}`,
      accountId: goal.accountId,
      userId: user.id,
      category: "savings", // ✅ FIXED
      date: new Date(),
    },
  });

  // 4️⃣ 🔥 UPDATE BUDGET (THIS IS THE FIX YOU NEED)
  const now = new Date();
  const monthString = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  await tx.budget.upsert({
    where: {
      userId_month: {
        userId: user.id,
        month: monthString,
      },
    },
    update: {
      spent: {
        increment: amount,
      },
    },
    create: {
      userId: user.id,
      month: monthString,
      amount: 0,
      spent: amount,
    },
  });

  return goalUpdate;
});


    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...updatedGoal,
        targetAmount: updatedGoal.targetAmount.toNumber(),
        savedAmount: updatedGoal.savedAmount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error adding funds to goal:", error);
    return { success: false, error: error.message };
  }
}
