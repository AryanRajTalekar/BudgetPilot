import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "budget-pilot", // Unique app ID
  name: "Budget Pilot", // App name
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
