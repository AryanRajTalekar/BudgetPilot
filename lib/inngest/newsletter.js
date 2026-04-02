import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import { NewsletterEmail } from "@/emails/NewsLetterEmail";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Runs every Sunday at 6 PM IST (12:30 UTC)
export const sendWeeklyNewsletter = inngest.createFunction(
  {
    id: "send-weekly-newsletter",
    name: "Send Weekly Finance Newsletter",
  },
  { cron: "30 12 * * 0" },
  async ({ step }) => {

    // 1. Fetch all active subscribers
    const subscribers = await step.run("fetch-subscribers", async () => {
      return db.newsletterSubscriber.findMany({
        where: { active: true },
        select: { email: true },
      });
    });

    if (!subscribers.length) return { skipped: true, reason: "no_subscribers" };

    // 2. Generate content with Gemini (once for all subscribers)
    const content = await step.run("generate-content", async () => {
      return generateNewsletterContent();
    });

    // 3. Send to each subscriber
    const results = [];
    for (const subscriber of subscribers) {
      const result = await step.run(`send-${subscriber.email}`, async () => {
        try {
          await sendEmail({
            to: subscriber.email,
            subject: `📈 BudgetPilot Weekly: ${content.marketSummary.headline}`,
            react: NewsletterEmail({
              date: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              marketSummary: content.marketSummary,
              ideas: content.ideas,
            }),
          });
          return { email: subscriber.email, success: true };
        } catch (err) {
          console.error(`Failed to send to ${subscriber.email}:`, err);
          return { email: subscriber.email, success: false };
        }
      });
      results.push(result);
    }

    return {
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      total: subscribers.length,
    };
  }
);

// ─── Gemini content generator ─────────────────────────────────────
async function generateNewsletterContent() {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const prompt = `
You are a financial newsletter writer for Indian retail investors.
Today is ${today}. Write this week's finance newsletter content.

Return ONLY valid JSON:
{
  "marketSummary": {
    "headline": "punchy one-line summary of the week in Indian markets",
    "summary": "2-3 sentences covering Nifty 50, Sensex, key events, FII/DII activity, RBI or global macro impact",
    "indices": [
      { "name": "Nifty 50",  "change": "+X.XX%" },
      { "name": "Sensex",    "change": "-X.XX%" },
      { "name": "Bank Nifty","change": "+X.XX%" },
      { "name": "Gold",      "change": "+X.XX%" }
    ]
  },
  "ideas": [
    {
      "title": "idea title",
      "description": "2-3 sentence explanation of this investment idea or strategy, grounded in current market conditions",
      "tip": "one actionable tip the reader can act on this week"
    },
    {
      "title": "idea title",
      "description": "2-3 sentences",
      "tip": "one actionable tip"
    },
    {
      "title": "idea title",
      "description": "2-3 sentences",
      "tip": "one actionable tip"
    }
  ]
}

Keep it educational, India-focused (NSE/BSE, SIP, FD, Nifty), beginner-friendly, and not speculative.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(text);
  } catch {
    // Safe fallback
    return {
      marketSummary: {
        headline: "Markets consolidate amid global uncertainty",
        summary: "Indian markets traded range-bound this week as FIIs remained cautious ahead of US Fed commentary. Nifty 50 held key support levels while mid-caps showed relative strength.",
        indices: [
          { name: "Nifty 50",   change: "+0.40%" },
          { name: "Sensex",     change: "+0.35%" },
          { name: "Bank Nifty", change: "-0.20%" },
          { name: "Gold",       change: "+0.80%" },
        ],
      },
      ideas: [
        {
          title: "SIP in Index Funds — Stay the Course",
          description: "Volatile weeks are the best time to remember why SIPs work. Rupee cost averaging means you buy more units when prices dip, lowering your average cost over time.",
          tip: "If you haven't started a Nifty 50 index fund SIP yet, open one on Zerodha Coin or Groww this weekend with as little as ₹500/month.",
        },
        {
          title: "Emergency Fund First",
          description: "Before chasing market returns, ensure you have 3–6 months of expenses in a liquid fund or high-yield savings account. This prevents panic-selling during downturns.",
          tip: "Move one month's expenses into a liquid mutual fund today — it earns ~7% and stays accessible within 1 business day.",
        },
        {
          title: "Gold as a Hedge",
          description: "Gold has historically performed well during periods of equity uncertainty. A 5–10% allocation through Sovereign Gold Bonds (SGBs) or Gold ETFs can reduce portfolio volatility.",
          tip: "Check the RBI SGB calendar — the next tranche may be open soon, offering 2.5% annual interest on top of gold price appreciation.",
        },
      ],
    };
  }
}