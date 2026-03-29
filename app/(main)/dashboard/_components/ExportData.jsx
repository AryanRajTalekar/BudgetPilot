"use client";

import { useState, useTransition } from "react";
import { getExportData } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const PERIODS = [
  { label: "Last 1 month",  value: 1 },
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last 1 year",   value: 12 },
];

export function ExportData() {
  const [months, setMonths] = useState(3);
  const [pending, startTransition] = useTransition();


  const exportCSV = () => {
    startTransition(async () => {
      const rows = await getExportData({ months });
      if (!rows?.length) return toast.error("No transactions found");

      const headers = ["Date", "Description", "Category", "Type", "Amount (₹)", "Account", "Status"];
      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          [
            r.date,
            `"${r.description.replace(/"/g, '""')}"`,
            r.category,
            r.type,
            r.amount.toFixed(2),
            `"${r.account}"`,
            r.status,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `budgetpilot-transactions-${months}m.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} transactions`);
    });
  };

  const exportPDF = () => {
    startTransition(async () => {
      const rows = await getExportData({ months });
      if (!rows?.length) return toast.error("No transactions found");

      const totalIncome   = rows.filter(r => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
      const totalExpenses = rows.filter(r => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);
      const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>BudgetPilot — Transaction Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; font-size: 12px; color: #111; padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .sub { color: #6B7280; font-size: 12px; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { background: #F9FAFB; border-radius: 8px; padding: 12px 16px; flex: 1; }
    .stat-label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-val { font-size: 18px; font-weight: 700; margin-top: 2px; }
    .income { color: #10B981; } .expense { color: #EF4444; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #111827; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; }
    td { padding: 7px 10px; border-bottom: 1px solid #E5E7EB; font-size: 11px; }
    tr:nth-child(even) td { background: #F9FAFB; }
    .income-row { color: #10B981; font-weight: 600; }
    .expense-row { color: #EF4444; font-weight: 600; }
    .footer { margin-top: 24px; font-size: 10px; color: #9CA3AF; text-align: center; }
  </style>
</head>
<body>
  <h1>BudgetPilot</h1>
  <p class="sub">Transaction Report — Last ${months} month${months > 1 ? "s" : ""} · Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
  <div class="summary">
    <div class="stat"><div class="stat-label">Total Income</div><div class="stat-val income">${fmt(totalIncome)}</div></div>
    <div class="stat"><div class="stat-label">Total Expenses</div><div class="stat-val expense">${fmt(totalExpenses)}</div></div>
    <div class="stat"><div class="stat-label">Net Savings</div><div class="stat-val">${fmt(totalIncome - totalExpenses)}</div></div>
    <div class="stat"><div class="stat-label">Transactions</div><div class="stat-val">${rows.length}</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Account</th><th>Amount</th></tr></thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td>${r.date}</td>
          <td>${r.description || "—"}</td>
          <td style="text-transform:capitalize">${r.category}</td>
          <td>${r.account}</td>
          <td class="${r.type === "INCOME" ? "income-row" : "expense-row"}">
            ${r.type === "INCOME" ? "+" : "−"}${fmt(r.amount)}
          </td>
        </tr>`).join("")}
    </tbody>
  </table>
  <p class="footer">© ${new Date().getFullYear()} BudgetPilot · This report is for personal reference only.</p>
</body>
</html>`;

      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      win.onload = () => {
        win.print();
        win.close();
      };
      toast.success("PDF ready — use your browser's Save as PDF option");
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Export Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setMonths(p.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                months === p.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={pending}
            className="flex-1 gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            {pending ? "Preparing…" : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPDF}
            disabled={pending}
            className="flex-1 gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            {pending ? "Preparing…" : "Export PDF"}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          PDF opens a print dialog — choose &quot;Save as PDF&quot; in your browser.
        </p>
      </CardContent>
    </Card>
  );
}