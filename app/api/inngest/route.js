import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
  processBankStatement,
  processReceiptScan,
} from "@/lib/inngest/function";

// NEW
import { investmentAdvisorMonthly, investmentAdvisorOnDemand } from "@/lib/inngest/investmentAdvisor";
import { weeklyFinanceDigest, enhancedBudgetAlerts } from "@/lib/inngest/weeklyDigestAndAlerts";
import { sendWeeklyNewsletter } from "@/lib/inngest/newsletter";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,
    triggerRecurringTransactions,
    generateMonthlyReports,
    checkBudgetAlerts,
    processBankStatement,
    // new
    investmentAdvisorMonthly,
    investmentAdvisorOnDemand,
    weeklyFinanceDigest,
    enhancedBudgetAlerts,
    sendWeeklyNewsletter,
    processReceiptScan
  ],
});
