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

    // update goal saved amount
    const updatedGoal = await db.lifeGoal.update({
      where: { id: goalId },
      data: {
        savedAmount: {
          increment: amount,
        },
      },
    });

    // reduce account balance
    await db.account.update({
      where: { id: goal.accountId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // create transaction
    await db.transaction.create({
      data: {
        type: "EXPENSE",
        amount,
        description: `Contribution to goal: ${goal.title}`,
        accountId: goal.accountId,
        userId: user.id,
        category: "Savings",
        date: new Date(),
      },
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
