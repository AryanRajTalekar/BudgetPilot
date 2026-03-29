import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGoalsWithIntelligence } from "@/actions/goalsIntelligence";
import { GoalIntelligenceCard } from "@/components/goals/GoalIntelligenceCard";

export const metadata = {
  title: "Financial Goals | BudgetPilot",
  description: "Track your financial goals with AI-powered progress insights.",
};

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const goals = await getGoalsWithIntelligence();

  const active    = goals.filter((g) => g.status === "ACTIVE");
  const completed = goals.filter((g) => g.status === "COMPLETED");

  const totalTarget = active.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved  = active.reduce((s, g) => s + g.savedAmount,  0);
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered progress tracking and personalized savings nudges.
        </p>
      </div>

      {/* Overall summary */}
      {active.length > 0 && (
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-semibold">Overall Progress</p>
            <p className="text-sm text-muted-foreground">{overallPct}%</p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fmt(totalSaved)} saved</span>
            <span>{fmt(totalTarget)} target across {active.length} goals</span>
          </div>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Active Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((goal) => (
              <GoalIntelligenceCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-1">No active goals</p>
          <p className="text-sm">Create a life goal to start tracking your savings.</p>
        </div>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((goal) => (
              <GoalIntelligenceCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}