"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { createNotification } from "@/lib/notifications";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // ✅ Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      // Calculate month string from transaction date
      const monthString = new Date(data.date).toISOString().slice(0, 7); // "YYYY-MM"

      // SAFE budget update
      if (data.type === "EXPENSE") {
        await tx.budget.upsert({
          where: {
            userId_month: { userId: user.id, month: monthString },
          },
          update: {
            spent: { increment: data.amount }, // increment spent for this month
          },
          create: {
            userId: user.id,
            month: monthString,
            amount: 0, // default budget, can be updated later
            spent: data.amount,
          },
        });
      }

      return newTransaction;
    });

    // 🔔 NOTIFICATIONS

    // 1. Large expense alert
    if (data.type === "EXPENSE" && data.amount >= 5000) {
      await createNotification({
        userId: user.id,
        title: "💸 Large Expense",
        message: `You spent ₹${data.amount}. Keep track of big expenses.`,
        type: "ALERT",
      });
    }

    // 2. First transaction dopamine hit 😄
    const count = await db.transaction.count({
      where: { userId: user.id },
    });

    if (count === 1) {
      await createNotification({
        userId: user.id,
        title: "🎉 First Transaction!",
        message: "Great start! You're now tracking your finances.",
        type: "SYSTEM",
      });
    }

    // 3. Income notification
    if (data.type === "INCOME") {
      await createNotification({
        userId: user.id,
        title: "💰 Income Added",
        message: `₹${data.amount} added to your account`,
        type: "INCOME",
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // ✅ Update account balance
      // 🧠 Handle account change properly
      if (originalTransaction.accountId !== data.accountId) {
        // 1. Revert old account
        const revertAmount =
          originalTransaction.type === "EXPENSE"
            ? originalTransaction.amount.toNumber()
            : -originalTransaction.amount.toNumber();

        await tx.account.update({
          where: { id: originalTransaction.accountId },
          data: {
            balance: {
              increment: revertAmount,
            },
          },
        });

        // 2. Apply to new account
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: newBalanceChange,
            },
          },
        });
      } else {
        // Normal case (same account)
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: netBalanceChange,
            },
          },
        });
      }

      // 🔥 NEW: Budget handling
      const oldExpense =
        originalTransaction.type === "EXPENSE"
          ? originalTransaction.amount.toNumber()
          : 0;

      const newExpense = data.type === "EXPENSE" ? data.amount : 0;

      const budgetChange = newExpense - oldExpense;

      if (budgetChange !== 0) {
        const budget = await tx.budget.findUnique({
          where: { userId: user.id },
        });

        if (budget) {
          await tx.budget.update({
            where: { userId: user.id },
            data: {
              amount: {
                decrement: budgetChange,
              },
            },
          });
        }
      }

      await createNotification({
        userId: user.id,
        title: "✏️ Transaction Updated",
        message: `Your transaction "${data.description}" was updated`,
        type: "UPDATE",
      });

      return updated;
    });
    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt (STABLE & WORKING)
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Analyze this receipt image and extract the following information in JSON format.

Return ONLY valid JSON in this exact format:
{
  "amount": number,
  "date": "ISO date string",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}

Categories:
housing, transportation, groceries, utilities, entertainment,
food, shopping, healthcare, education, personal, travel,
insurance, gifts, bills, other-expense

Rules:
- amount must be the final total
- date must be ISO format
- description must be short
- if not a receipt, return {}
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text(); // ✅ THIS WORKS
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const data = JSON.parse(cleanedText);

    if (!data.amount) return {};

    await createNotification({
      userId,
      title: "🧾 Receipt Scanned",
      message: `₹${data.amount} from ${data.merchantName} detected`,
      type: "AI",
    });

    return {
      amount: Number(data.amount),
      date: new Date(data.date),
      description: data.description,
      merchantName: data.merchantName,
      category: data.category,
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
