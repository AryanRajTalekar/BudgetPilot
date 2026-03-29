"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────
// FEATURE 5: EMI / Debt Tracker
// Requires EmiLoan model in schema (see schema_additions.prisma)
// All calculation logic is pure JS — no external dependencies
// ─────────────────────────────────────────────────────────────────

const serializeLoan = (loan) => ({
  ...loan,
  loanAmount: loan.loanAmount.toNumber(),
  interestRate: loan.interestRate.toNumber(),
  emiAmount: loan.emiAmount.toNumber(),
});

// ─── CRUD Actions ─────────────────────────────────────────────────

export async function createEmiLoan(data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Auto-calculate EMI if not provided
  const emiAmount = data.emiAmount || calculateEMI(
    data.loanAmount,
    data.interestRate,
    data.tenureMonths
  );

  const loan = await db.emiLoan.create({
    data: {
      name: data.name,
      loanAmount: data.loanAmount,
      interestRate: data.interestRate,
      emiAmount,
      tenureMonths: data.tenureMonths,
      paidMonths: data.paidMonths ?? 0,
      startDate: new Date(data.startDate),
      userId: user.id,
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "🏦 Loan Added",
      message: `"${loan.name}" added. EMI: ₹${Math.round(emiAmount).toLocaleString("en-IN")}/month for ${data.tenureMonths} months.`,
      type: "LOAN_ADDED",
    },
  });

  revalidatePath("/emi");
  return { success: true, data: serializeLoan(loan) };
}

export async function getUserEmiLoans() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const loans = await db.emiLoan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return loans.map((loan) => {
    const s = serializeLoan(loan);
    return { ...s, ...computeLoanDetails(s) };
  });
}

export async function getEmiLoanById(loanId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const loan = await db.emiLoan.findUnique({
    where: { id: loanId, userId: user.id },
  });
  if (!loan) throw new Error("Loan not found");

  const s = serializeLoan(loan);
  return { ...s, ...computeLoanDetails(s) };
}

export async function markEmiPaid(loanId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const loan = await db.emiLoan.findUnique({
    where: { id: loanId, userId: user.id },
  });
  if (!loan) throw new Error("Loan not found");

  const newPaid = loan.paidMonths + 1;
  const isCompleted = newPaid >= loan.tenureMonths;

  const updated = await db.emiLoan.update({
    where: { id: loanId },
    data: {
      paidMonths: newPaid,
      status: isCompleted ? "CLOSED" : "ACTIVE",
    },
  });

  if (isCompleted) {
    await db.notification.create({
      data: {
        userId: user.id,
        title: "🎉 Loan Fully Paid!",
        message: `Congratulations! "${loan.name}" is fully paid off.`,
        type: "LOAN_COMPLETED",
      },
    });
  }

  revalidatePath("/emi");
  return { success: true, data: serializeLoan(updated) };
}

export async function deleteEmiLoan(loanId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  await db.emiLoan.delete({ where: { id: loanId, userId: user.id } });

  revalidatePath("/emi");
  return { success: true };
}

// ─── Calculation Actions ──────────────────────────────────────────

// Full amortization schedule + projections
export async function getLoanDetails(loanId) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const loan = await db.emiLoan.findUnique({
    where: { id: loanId, userId: user.id },
  });
  if (!loan) throw new Error("Loan not found");

  const s = serializeLoan(loan);
  const details = computeLoanDetails(s);
  const schedule = buildAmortizationSchedule(s);

  return { success: true, loan: s, details, schedule };
}

// Simulate early payoff with extra monthly payment
export async function simulateEarlyPayoff(loanId, extraMonthlyPayment) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const loan = await db.emiLoan.findUnique({
    where: { id: loanId, userId: user.id },
  });
  if (!loan) throw new Error("Loan not found");

  const s = serializeLoan(loan);
  const result = simulateExtraPayment(s, extraMonthlyPayment);

  return { success: true, simulation: result };
}

// Pure calculation — no auth needed (used client-side for EMI calculator widget)
export async function calculateLoanEMI({ loanAmount, interestRate, tenureMonths }) {
  const emi = calculateEMI(loanAmount, interestRate, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    success: true,
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    interestToLoanRatio: Math.round((totalInterest / loanAmount) * 100),
  };
}

// ─── Pure Calculation Functions ──────────────────────────────────

function calculateEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return emi;
}

function computeLoanDetails(loan) {
  const { loanAmount, interestRate, emiAmount, tenureMonths, paidMonths, startDate } = loan;

  const remainingMonths = Math.max(0, tenureMonths - paidMonths);
  const r = interestRate / 12 / 100;

  // Outstanding principal using reverse amortization
  let outstanding = loanAmount;
  for (let i = 0; i < paidMonths; i++) {
    const interest = outstanding * r;
    const principal = emiAmount - interest;
    outstanding = Math.max(0, outstanding - principal);
  }

  const totalPaid = emiAmount * paidMonths;
  const totalInterestPaid = totalPaid - (loanAmount - outstanding);

  const expectedEndDate = new Date(startDate);
  expectedEndDate.setMonth(expectedEndDate.getMonth() + tenureMonths);

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + remainingMonths);

  const totalCost = emiAmount * tenureMonths;
  const totalInterest = totalCost - loanAmount;
  const progressPct = tenureMonths > 0 ? Math.round((paidMonths / tenureMonths) * 100) : 0;

  return {
    outstanding: Math.round(outstanding),
    remainingMonths,
    totalPaid: Math.round(totalPaid),
    totalInterestPaid: Math.round(Math.max(0, totalInterestPaid)),
    totalCost: Math.round(totalCost),
    totalInterest: Math.round(totalInterest),
    payoffDate,
    progressPct,
  };
}

function buildAmortizationSchedule(loan) {
  const { loanAmount, interestRate, emiAmount, tenureMonths, paidMonths, startDate } = loan;
  const r = interestRate / 12 / 100;

  let balance = loanAmount;
  const schedule = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestComponent = balance * r;
    const principalComponent = Math.min(emiAmount - interestComponent, balance);
    balance = Math.max(0, balance - principalComponent);

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      month,
      paymentDate: paymentDate.toISOString().slice(0, 10),
      emi: Math.round(emiAmount),
      principal: Math.round(principalComponent),
      interest: Math.round(interestComponent),
      balance: Math.round(balance),
      isPaid: month <= paidMonths,
    });
  }

  return schedule;
}

function simulateExtraPayment(loan, extraMonthly) {
  const { loanAmount, interestRate, emiAmount, tenureMonths, paidMonths } = loan;
  const r = interestRate / 12 / 100;

  const newEMI = emiAmount + extraMonthly;

  // Current outstanding
  let balance = loanAmount;
  for (let i = 0; i < paidMonths; i++) {
    const interest = balance * r;
    balance = Math.max(0, balance - (emiAmount - interest));
  }

  // Simulate with extra payment
  let monthsWithExtra = 0;
  let tempBalance = balance;
  let totalInterestWithExtra = 0;

  while (tempBalance > 0 && monthsWithExtra < tenureMonths * 2) {
    const interest = tempBalance * r;
    totalInterestWithExtra += interest;
    tempBalance = Math.max(0, tempBalance - (newEMI - interest));
    monthsWithExtra++;
  }

  // Simulate without extra payment
  let monthsNormal = 0;
  let tempBalanceNormal = balance;
  let totalInterestNormal = 0;

  while (tempBalanceNormal > 0 && monthsNormal < tenureMonths * 2) {
    const interest = tempBalanceNormal * r;
    totalInterestNormal += interest;
    tempBalanceNormal = Math.max(0, tempBalanceNormal - (emiAmount - interest));
    monthsNormal++;
  }

  const monthsSaved = monthsNormal - monthsWithExtra;
  const interestSaved = totalInterestNormal - totalInterestWithExtra;

  const payoffDateEarly = new Date();
  payoffDateEarly.setMonth(payoffDateEarly.getMonth() + monthsWithExtra);

  const payoffDateNormal = new Date();
  payoffDateNormal.setMonth(payoffDateNormal.getMonth() + monthsNormal);

  return {
    extraMonthly,
    newEMI: Math.round(newEMI),
    monthsWithExtra,
    monthsNormal,
    monthsSaved,
    interestSaved: Math.round(interestSaved),
    totalInterestWithExtra: Math.round(totalInterestWithExtra),
    totalInterestNormal: Math.round(totalInterestNormal),
    payoffDateEarly,
    payoffDateNormal,
  };
}