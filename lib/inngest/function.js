import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { createNotification } from "@/lib/notifications";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance in a transaction
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              transaction.nextRecurringDate || new Date(),
              transaction.recurringInterval,
            ),
          },
        });

        await db.notification.create({
          data: {
            userId: transaction.userId,
            title: "🔁 Recurring Transaction Processed",
            message: `${transaction.description} of ₹${transaction.amount} was added`,
            type: "RECURRING",
          },
        });
      });
    });
  },
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      },
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  },
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Highlight any categories that take up a large portion of the budget.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income:  ₹${stats.totalIncome}
    - Total Expenses:  ₹${stats.totalExpenses}
    - Net Income:  ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}:  ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthString = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
    const monthName = lastMonth.toLocaleString("default", { month: "long" });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        // Fetch user's budget for last month
        const budget = await db.budget.findUnique({
          where: { userId_month: { userId: user.id, month: monthString } },
        });

        // Get monthly stats (transactions)
        const stats = await getMonthlyStats(user.id, lastMonth);

        // Override totalExpenses if budget exists
        const totalExpenses = budget
          ? budget.spent.toNumber()
          : stats.totalExpenses;
        stats.totalExpenses = totalExpenses;

        const budgetAmount = budget ? budget.amount.toNumber() : 0;
        const remaining = budgetAmount - totalExpenses;

        // Fetch last 5 transactions
        const lastTransactions = await db.transaction.findMany({
          where: {
            userId: user.id,
            date: {
              gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
              lte: new Date(
                lastMonth.getFullYear(),
                lastMonth.getMonth() + 1,
                0,
              ),
            },
          },
          orderBy: { date: "desc" },
          take: 5,
        });

        // AI Insights
        const aiTips = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats: {
                ...stats,
                totalIncome: stats.totalIncome.toFixed(2),
                totalExpenses: stats.totalExpenses.toFixed(2),
                netIncome: (
                  Math.round((stats.totalIncome - stats.totalExpenses) * 100) /
                  100
                ).toFixed(2),
                byCategory: Object.fromEntries(
                  Object.entries(stats.byCategory).map(([cat, amt]) => [
                    cat,
                    amt.toFixed(2),
                  ]),
                ),
              },
              budget: budgetAmount.toFixed(2),
              remaining: remaining.toFixed(2),
              month: monthName,
              lastTransactions,
              insights: aiTips,
              categoryBreakdown: stats.byCategory,
            },
          }),
        });

        // In-app notification

        await db.notification.create({
          data: {
            userId: user.id,
            title: "📊 Monthly Report Ready",
            message: `Your ${monthName} financial report is ready`,
            type: "MONTHLY_REPORT",
          },
        });
      });
    }

    return { processed: users.length };
  },
);

// 3. Budget Alerts with Event Batching

export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { event: "test/run" }, // ✅ keep manual for now
  async ({ step }) => {
    // ✅ STEP 1: Fetch budgets
    const budgets = await step.run("fetch-budgets", async () => {
      const budgetsData = await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });

      // ✅ CONVERT DECIMAL → NUMBER
      return budgetsData.map((b) => ({
        ...b,
        amount: b.amount.toNumber(),
        spent: b.spent.toNumber(),
      }));
    });

    // =========================
    // ✅ STEP 2: ADD THIS HERE
    // =========================
    for (const budget of budgets) {
      await step.run(`check-budget-${budget.id}`, async () => {
        const totalExpenses = Number(budget.spent ?? 0);
        const budgetAmount = Number(budget.amount ?? 0);

        const percentageUsed =
          budgetAmount > 0
            ? Math.floor((totalExpenses / budgetAmount) * 100)
            : 0;

        if (
          budget.lastAlertSent &&
          isNewMonth(new Date(budget.lastAlertSent), new Date())
        ) {
          await db.budget.update({
            where: { id: budget.id },
            data: {
              lastPercentageAlertSent: 0,
            },
          });

          budget.lastPercentageAlertSent = 0;
        }

        const thresholds = [80, 90, 100];
        const lastSent = Number(budget.lastPercentageAlertSent || 0);

        const nextThreshold = thresholds.find((threshold) => {
          return percentageUsed >= threshold && lastSent < threshold;
        });

        if (!nextThreshold) {
          
          return { skipped: true };
        }

        // ✅ SEND EMAIL
        try {
          await sendEmail({
            to: budget.user.email, // ✅ dynamic again
            subject: `⚠️ Budget Alert: ${nextThreshold}% reached`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: budgetAmount.toFixed(2),
                totalExpenses: totalExpenses.toFixed(2),
                remaining: (budgetAmount - totalExpenses).toFixed(2),
                accountName: budget.user.accounts[0]?.name,
                lastTransactions: [],
                categoryBreakdown: {},
                aiTips: [],
              },
            }),
          });

          // in-app notification

          await db.notification.create({
            data: {
              userId: budget.userId,
              title: "⚠️ Budget Alert",
              message: `You've used ${percentageUsed}% of your monthly budget.`,
              type: "BUDGET_ALERT",
            },
          });
        } catch (err) {
          return { error: "email_failed" };
        }

        // ✅ UPDATE DB (VERY IMPORTANT — prevents repeat emails)
        await db.budget.update({
          where: { id: budget.id },
          data: {
            lastAlertSent: new Date(),
            lastPercentageAlertSent: nextThreshold,
          },
        });

        return { success: true };
      });
    }

    // =========================

    // ✅ FINAL RETURN
    return { processed: budgets.length };
  },
);

// 4.generate budget insights with genAI
// async function generateBudgetInsights(totalExpenses, categoryTotals, month) {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

//   const categoryString = Object.entries(categoryTotals)
//     .map(
//       ([cat, amt]) =>
//         `${cat}: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt)}`,
//     )
//     .join(", ");

//   const prompt = `
// You are a friendly financial assistant. Analyze this budget data for ${month}:

// - Total Expenses so far:  ₹${totalExpenses.toFixed(2)}
// - Expense breakdown by category: ${categoryString}

// Provide 2-3 concise, actionable tips to help the user manage their budget better.
// Keep it simple, friendly, and practical.

// Return a JSON array of strings like this:
// ["tip 1", "tip 2", "tip 3"]
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
//     return JSON.parse(cleanedText);
//   } catch (error) {
//     console.error("Error generating budget insights:", error);
//     return [
//       "Keep an eye on your largest expense categories to stay within budget.",
//       "Try limiting discretionary spending to save more this month.",
//     ];
//   }
// }

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const monthString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const budget = await db.budget.findUnique({
    where: {
      userId_month: { userId, month: monthString },
    },
  });

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
      budgetAmount: budget?.amount || 0,
      budgetSpent: budget?.spent || 0,
    },
  );
}

//funtion to add pdfs
export const processBankStatement = inngest.createFunction(
  {
    id: "process-bank-statement",
    name: "Process Bank Statement",
  },
  { event: "statement/import" },
  async ({ event, step }) => {
    try {
      const { file, userId, accountId } = event.data;

      if (!file) {
        throw new Error("No file received");
      }

      const transactions = await step.run("extract-transactions", async () => {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const prompt = `
Extract ALL transactions from this bank statement.

Return ONLY valid JSON array, no explanation, no markdown.

Format:
[
  {
    "amount": number (always positive),
    "date": "YYYY-MM-DD",
    "description": "string",
    "merchantName": "string",
    "category": "string",
    "type": "INCOME or EXPENSE"
  }
]

Rules:
- date MUST be in YYYY-MM-DD format
- amount is always a positive number
- type is INCOME for credits/deposits, EXPENSE for debits/withdrawals
- category must be one of: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, savings, other-expense
`;

        const result = await model.generateContent([
          {
            inlineData: {
              data: file,
              mimeType: "application/pdf",
            },
          },
          prompt,
        ]);

        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);
      });

      await step.run("save-transactions", async () => {
  if (!transactions || transactions.length === 0) return;

  const parseDate = (raw) => {
    if (!raw) return new Date();
    // Already ISO — fast path
    const iso = new Date(raw);
    if (!isNaN(iso)) return iso;

    // DD/MM/YYYY or DD-MM-YYYY (common in Indian bank statements)
    const match = String(raw).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (match) {
      const [, d, m, y] = match;
      const year = y.length === 2 ? `20${y}` : y;
      return new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    }

    return new Date(); // fallback to today
  };

  await db.$transaction(async (tx) => {
    const formattedTransactions = transactions
      .filter((t) => t.amount != null && t.type != null && Number(t.amount) > 0)
      .map((t) => ({
        amount: Number(t.amount),
        date: parseDate(t.date),
        description: t.description || t.merchantName || "Imported transaction",
        category: t.category || "other-expense",
        type: String(t.type).toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE",
        userId,
        accountId,
      }));

    if (!formattedTransactions.length) return;

    await tx.transaction.createMany({
      data: formattedTransactions,
      skipDuplicates: true,
    });

    const totalIncome = formattedTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = formattedTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // ✅ Balance: +income -expense
    const totalBalanceChange = totalIncome - totalExpense;

    await tx.account.update({
      where: { id: accountId },
      data: { balance: { increment: totalBalanceChange } },
    });

    // ✅ Budget: only track expenses
    if (totalExpense > 0) {
      const now = new Date();
      const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      await tx.budget.upsert({
        where: { userId_month: { userId, month: monthString } },
        update: { spent: { increment: totalExpense } },
        create: { userId, month: monthString, amount: 0, spent: totalExpense },
      });
    }

    await tx.notification.create({
      data: {
        userId,
        title: "📥 Statement Imported",
        message: `${formattedTransactions.length} transactions imported — ₹${Math.round(totalIncome).toLocaleString("en-IN")} income, ₹${Math.round(totalExpense).toLocaleString("en-IN")} expenses`,
        type: "IMPORT",
      },
    });
  });
});

      return {
        success: true,
        transactionsImported: transactions.length,
      };
    } catch (error) {
      console.error("Bank statement processing error:", error);
      throw error;
    }
  },
);

export const sendNotificationEmail = inngest.createFunction(
  { id: "send-notification-email" },
  { event: "notification/email" },
  async ({ event }) => {
    const { userId, title, message } = event.data;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email) return;

    await sendEmail({
      to: user.email,
      subject: title,
      react: {
        type: "generic",
        data: { message },
      },
    });
  },
);
