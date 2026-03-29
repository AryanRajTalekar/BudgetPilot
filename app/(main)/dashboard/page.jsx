export const dynamic = "force-dynamic";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import SpendingHeatmap from "@/components/heatmap/SpendingHeatmap";
import { InvestmentAdvisorWidget } from "@/components/investment/InvestmentAdvisorWidget";
import { getGoalsWithIntelligence } from "@/actions/goalsIntelligence";
import { GoalIntelligenceCard } from "@/components/goals/GoalIntelligenceCard";
import { CreateGoalDrawer } from "@/components/goals/CreateGoalDrawer";
import { FinancialHealthScore } from "./_components/FinancialHealthScore";
import { ExportData } from "./_components/ExportData";
import { TaxSummary } from "./_components/TaxSummary";
import { EmiPageClient } from "@/app/emi/_components/EmiPageClient";
import { getUserEmiLoans } from "@/actions/emiTracker";

export default async function DashboardPage() {
  const [accounts, transactions, goals, loans] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getGoalsWithIntelligence(),
    getUserEmiLoans(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Financial Intelligence Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <FinancialHealthScore />
        <ExportData />
        <TaxSummary />
      </div>

      {/* EMI Tracker */}
      <div className="space-y-4 border rounded-xl p-5 space-y-5 shadow-sm">
        <h2 className="text-lg font-semibold">EMI & Loans</h2>
        <EmiPageClient initialLoans={loans} />
      </div>

      {/* Spending Heatmap */}
      <div>
        {/* <h2 className="text-lg font-semibold mb-2">Spending Activity</h2> */}
        <SpendingHeatmap months={12} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Financial Goals</h2>
          <CreateGoalDrawer />
        </div>

        {goals?.length > 0 ? (
          goals.map((goal) => (
            <GoalIntelligenceCard key={goal.id} goal={goal} />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No goals yet.{" "}
              <span className="text-foreground font-medium">
                Create your first goal
              </span>{" "}
              to start tracking progress.
            </CardContent>
          </Card>
        )}
      </div>

      <InvestmentAdvisorWidget />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}
