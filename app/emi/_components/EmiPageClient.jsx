"use client";

import { useState, useTransition } from "react";
import {
  LoanCard,
  AddLoanForm,
  EmiCalculator,
  EarlyPayoffSimulator,
} from "@/components/emi/EmiComponents";
import {
  markEmiPaid,
  deleteEmiLoan,
  getLoanDetails,
  getUserEmiLoans,
} from "@/actions/emiTracker";

export function EmiPageClient({ initialLoans }) {
  const [loans, setLoans]           = useState(initialLoans);
  const [tab, setTab]               = useState("loans");   // "loans" | "calculator"
  const [showAdd, setShowAdd]       = useState(false);
  const [selectedLoan, setSelected] = useState(null);      // for detail modal
  const [schedule, setSchedule]     = useState(null);
  const [, startTransition]  = useTransition();

  const refresh = () =>
    startTransition(async () => {
      const fresh = await getUserEmiLoans();
      setLoans(fresh);
    });

  const handleMarkPaid = (loanId) =>
    startTransition(async () => {
      await markEmiPaid(loanId);
      refresh();
    });

  const handleDelete = (loanId) =>
    startTransition(async () => {
      if (!confirm("Delete this loan?")) return;
      await deleteEmiLoan(loanId);
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
    });

  const handleViewDetail = async (loan) => {
    setSelected(loan);
    const res = await getLoanDetails(loan.id);
    if (res.success) setSchedule(res.schedule);
  };

  // Summary numbers
  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalEMI    = activeLoans.reduce((s, l) => s + l.emiAmount, 0);
  const totalDebt   = activeLoans.reduce((s, l) => s + (l.outstanding ?? 0), 0);

  const fmt = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 border rounded-xl">
        <SummaryCard label="Active Loans"   value={activeLoans.length} />
        <SummaryCard label="Total Monthly EMI" value={fmt(totalEMI)} />
        <SummaryCard label="Total Outstanding" value={fmt(totalDebt)} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border border-border rounded-lg p-1 w-fit">
        {["loans", "calculator"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "loans" ? "My Loans" : "EMI Calculator"}
          </button>
        ))}
      </div>

      {tab === "loans" && (
        <div className="space-y-4">
          {/* Add loan button */}
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="text-sm border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors"
          >
            {showAdd ? "Cancel" : "+ Add Loan"}
          </button>

          {showAdd && (
            <div className="border border-border rounded-xl p-5 bg-muted/20">
              <p className="text-sm font-semibold mb-4">Add New Loan</p>
              <AddLoanForm
                onSuccess={() => {
                  setShowAdd(false);
                  refresh();
                }}
              />
            </div>
          )}

          {loans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-1">No loans tracked yet</p>
              <p className="text-sm">Add your first loan to start tracking EMIs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => (
                <div key={loan.id} className="relative">
                  <LoanCard
                    loan={loan}
                    onMarkPaid={handleMarkPaid}
                    onViewDetail={handleViewDetail}
                  />
                  <button
                    onClick={() => handleDelete(loan.id)}
                    className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "calculator" && (
        <div className="max-w-md">
          <div className="border border-border rounded-xl p-5">
            <p className="text-sm font-semibold mb-4">EMI Calculator</p>
            <EmiCalculator />
          </div>
        </div>
      )}

      {/* Loan detail modal */}
      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          schedule={schedule}
          onClose={() => { setSelected(null); setSchedule(null); }}
        />
      )}
    </>
  );
}

// ─── Loan detail modal ────────────────────────────────────────────
function LoanDetailModal({ loan, schedule, onClose }) {
  const [simTab, setSimTab] = useState("schedule"); // "schedule" | "simulate"
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <p className="font-semibold">{loan.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loan.interestRate}% p.a. · {loan.tenureMonths} months · EMI {fmt(loan.emiAmount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-3 border-b border-border shrink-0">
          {["schedule", "simulate"].map((t) => (
            <button
              key={t}
              onClick={() => setSimTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                simTab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "schedule" ? "Amortization Schedule" : "Early Payoff Simulator"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          {simTab === "schedule" && (
            <AmortizationTable schedule={schedule} />
          )}
          {simTab === "simulate" && (
            <EarlyPayoffSimulator loanId={loan.id} />
          )}
        </div>
      </div>
    </div>
  );
}

function AmortizationTable({ schedule }) {
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (!schedule) return (
    <div className="text-center py-8 text-muted-foreground text-sm">Loading schedule…</div>
  );

  return (
    <div className="space-y-1 text-xs">
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 pb-2 border-b border-border font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">
        <span>Month</span>
        <span className="text-right">EMI</span>
        <span className="text-right">Principal</span>
        <span className="text-right">Interest</span>
        <span className="text-right">Balance</span>
      </div>
      {schedule.map((row) => (
        <div
          key={row.month}
          className={`grid grid-cols-5 gap-2 py-1.5 rounded px-1 ${
            row.isPaid ? "bg-emerald-50 dark:bg-emerald-950/30 text-muted-foreground" : ""
          }`}
        >
          <span className="flex items-center gap-1">
            {row.isPaid && <span className="text-emerald-500 text-[10px]">✓</span>}
            {row.month}
          </span>
          <span className="text-right">{fmt(row.emi)}</span>
          <span className="text-right text-emerald-600">{fmt(row.principal)}</span>
          <span className="text-right text-red-400">{fmt(row.interest)}</span>
          <span className="text-right font-medium">{fmt(row.balance)}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-muted/50 rounded-xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}