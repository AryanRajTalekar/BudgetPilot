"use client";

import { useState, useTransition } from "react";
import {
  createEmiLoan,
  getUserEmiLoans,
  getLoanDetails,
  simulateEarlyPayoff,
  markEmiPaid,
  calculateLoanEMI,
} from "@/actions/emiTracker";

// ─────────────────────────────────────────────────────────────────
// FEATURE 5: EMI Loan Dashboard Components
//
// <EmiCalculator />      — standalone calculator, no auth needed
// <EmiLoanList loans />  — list of user's loans with details
// <AddLoanForm />        — form to add a new loan
// <LoanDetailModal />    — full amortization + early payoff sim
// ─────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ─── EMI Calculator (no auth, instant) ───────────────────────────
export function EmiCalculator() {
  const [form, setForm] = useState({ loanAmount: 500000, interestRate: 8.5, tenureMonths: 60 });
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();

  const update = (k, v) => setForm((f) => ({ ...f, [k]: Number(v) }));

  const calculate = () => {
    startTransition(async () => {
      const res = await calculateLoanEMI(form);
      if (res.success) setResult(res);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <LabeledInput
          label="Loan Amount (₹)"
          value={form.loanAmount}
          onChange={(v) => update("loanAmount", v)}
          type="number"
        />
        <LabeledInput
          label="Annual Interest Rate (%)"
          value={form.interestRate}
          onChange={(v) => update("interestRate", v)}
          type="number"
          step="0.1"
        />
        <LabeledInput
          label="Tenure (months)"
          value={form.tenureMonths}
          onChange={(v) => update("tenureMonths", v)}
          type="number"
        />
      </div>

      <button
        onClick={calculate}
        disabled={pending}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Calculating…" : "Calculate EMI"}
      </button>

      {result && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <ResultCard label="Monthly EMI" value={fmt(result.emi)} highlight />
          <ResultCard label="Total Payment" value={fmt(result.totalPayment)} />
          <ResultCard label="Total Interest" value={fmt(result.totalInterest)} />
          <ResultCard label="Interest Ratio" value={`${result.interestToLoanRatio}%`} />
        </div>
      )}
    </div>
  );
}

// ─── Add Loan Form ────────────────────────────────────────────────
export function AddLoanForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    loanAmount: "",
    interestRate: "",
    tenureMonths: "",
    paidMonths: 0,
    startDate: new Date().toISOString().slice(0, 10),
    emiAmount: "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.loanAmount || !form.interestRate || !form.tenureMonths) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createEmiLoan({
        ...form,
        loanAmount: Number(form.loanAmount),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
        paidMonths: Number(form.paidMonths),
        emiAmount: form.emiAmount ? Number(form.emiAmount) : undefined,
      });
      if (res.success) onSuccess?.(res.data);
    });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <LabeledInput label="Loan Name *" value={form.name} onChange={(v) => update("name", v)} placeholder="e.g. Home Loan - HDFC" />
      <div className="grid grid-cols-2 gap-3">
        <LabeledInput label="Loan Amount (₹) *" value={form.loanAmount} onChange={(v) => update("loanAmount", v)} type="number" />
        <LabeledInput label="Interest Rate (%) *" value={form.interestRate} onChange={(v) => update("interestRate", v)} type="number" step="0.1" />
        <LabeledInput label="Tenure (months) *" value={form.tenureMonths} onChange={(v) => update("tenureMonths", v)} type="number" />
        <LabeledInput label="Months Already Paid" value={form.paidMonths} onChange={(v) => update("paidMonths", v)} type="number" />
        <LabeledInput label="Start Date *" value={form.startDate} onChange={(v) => update("startDate", v)} type="date" />
        <LabeledInput label="EMI Amount (₹) — auto if blank" value={form.emiAmount} onChange={(v) => update("emiAmount", v)} type="number" />
      </div>
      <button
        onClick={submit}
        disabled={pending}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add Loan"}
      </button>
    </div>
  );
}

// ─── Loan Card ────────────────────────────────────────────────────
export function LoanCard({ loan, onMarkPaid, onViewDetail }) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm">{loan.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loan.interestRate}% · {loan.tenureMonths} months · Started {new Date(loan.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{loan.paidMonths} of {loan.tenureMonths} months paid</span>
          <span>{loan.progressPct ?? 0}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${loan.progressPct ?? 0}%` }}
          />
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniStat label="EMI" value={fmt(loan.emiAmount)} />
        <MiniStat label="Outstanding" value={fmt(loan.outstanding ?? 0)} />
        <MiniStat label="Payoff" value={loan.payoffDate ? new Date(loan.payoffDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) : "—"} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onViewDetail?.(loan)}
          className="flex-1 text-xs border border-border rounded-lg py-1.5 hover:bg-muted transition-colors"
        >
          Details & Simulate
        </button>
        {loan.status === "ACTIVE" && (
          <button
            onClick={() => onMarkPaid?.(loan.id)}
            className="flex-1 text-xs bg-emerald-600 text-white rounded-lg py-1.5 hover:bg-emerald-700 transition-colors"
          >
            Mark EMI Paid
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Early Payoff Simulator ───────────────────────────────────────
export function EarlyPayoffSimulator({ loanId }) {
  const [extra, setExtra] = useState(0);
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();

  const simulate = () => {
    if (!extra || extra <= 0) return;
    startTransition(async () => {
      const res = await simulateEarlyPayoff(loanId, Number(extra));
      if (res.success) setResult(res.simulation);
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Extra Monthly Payment Simulator</p>
      <div className="flex gap-3">
        <input
          type="number"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Extra ₹/month"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={simulate}
          disabled={pending}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "…" : "Simulate"}
        </button>
      </div>

      {result && (
        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Pay off {result.monthsSaved} months earlier
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Payoff with extra</p>
              <p className="font-medium">{new Date(result.payoffDateEarly).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Interest saved</p>
              <p className="font-medium text-emerald-600">{fmt(result.interestSaved)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">New monthly EMI</p>
              <p className="font-medium">{fmt(result.newEMI)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Months saved</p>
              <p className="font-medium">{result.monthsSaved} months</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────
function LabeledInput({ label, value, onChange, type = "text", step, placeholder }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function ResultCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-muted/50 rounded-lg py-2">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:   "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CLOSED:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    DEFAULTED:"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}