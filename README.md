# BudgetPilot 💰

An AI-powered personal finance management platform built for the modern Indian investor. Track expenses, set savings goals, manage EMI loans, get weekly market insights, and receive AI-generated investment advice — all in one place.

---

## Features

- **Dashboard** — Real-time overview of accounts, expenses, budget usage, and net worth
- **Transaction Tracking** — Add, categorize, and manage income and expenses across multiple accounts
- **Budget Alerts** — Automated email alerts at 80%, 90%, and 100% of your monthly budget
- **AI Weekly Digest** — Personalized weekly finance summary emailed every Sunday with spending breakdown and AI insights
- **Goal Intelligence** — Set savings goals with smart velocity tracking, projected completion dates, and AI nudges
- **EMI Loan Tracker** — Full amortization schedules, early payoff simulation, and monthly EMI tracking
- **Investment Advisor** — AI-generated monthly investment plan based on your surplus income
- **Weekly Market Newsletter** — Sunday evening newsletter with Indian market news and investment ideas
- **Financial Health Score** — A 0–100 score computed from savings rate, budget adherence, goal progress, and EMI burden
- **Tax Summary** — Indian FY (April–March) income and expense breakdown with potential deduction estimates
- **Export** — Download transactions as CSV or PDF
- **Spending Heatmap** — Visual calendar of spending activity over the last 12 months
- **Bank Statement Import** — Upload PDF bank statements and auto-extract transactions using AI
- **Recurring Transactions** — Set up and auto-process recurring income and expenses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Clerk |
| AI | Google Gemini |
| Email | Resend + React Email |
| Background Jobs | Inngest |
| Rate Limiting | Arcjet |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Render |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Accounts on: Clerk, Resend, Inngest, Arcjet, Google AI Studio

### Installation
```bash
git clone https://github.com/yourusername/budgetpilot.git
cd budgetpilot
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env` file in the root directory with the following keys:
```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Google Gemini AI
GEMINI_API_KEY=

# Resend (Email)
RESEND_API_KEY=

# Arcjet (Rate Limiting)
ARCJET_KEY=
```

### Database Setup
```bash
npx prisma migrate dev
npx prisma generate
```

### Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Inngest Dev Server

In a separate terminal:
```bash
npx inngest-cli@latest dev
```

---

## Project Structure
```
budgetpilot/
├── app/                  # Next.js App Router pages
│   ├── (main)/
│   │   ├── dashboard/    # Main dashboard
│   │   ├── emi/          # EMI tracker page
│   │   └── ...
│   └── api/
│       └── inngest/      # Inngest webhook handler
├── actions/              # Server actions
├── components/           # React components
├── emails/               # React Email templates
├── lib/
│   ├── inngest/          # Background job functions
│   └── prisma.js         # Prisma client
└── prisma/
    └── schema.prisma     # Database schema
```

---

## Background Jobs

All scheduled tasks run via Inngest:

| Job | Schedule |
|---|---|
| Recurring transaction processing | Daily at midnight |
| Monthly finance report | 1st of every month |
| Budget alerts | On transaction events |
| AI investment advisor | 2nd of every month |
| Weekly finance digest | Every Sunday |
| Weekly market newsletter | Every Sunday 6 PM IST |

---

## Deployment

The app is deployed on **Render** with a connected custom domain.

Set all environment variables in your Render dashboard under **Environment**. Make sure your Inngest functions are reachable at `/api/inngest`.

---

## License

MIT

---

Built by Aryan Talekar
```

---

**Project Description**:
AI-powered personal finance app for Indian users. Track expenses, manage EMI loans, set savings goals with velocity tracking, get weekly AI investment advice, and receive automated budget alerts. Built with Next.js 15, Prisma, Gemini AI, Inngest, and Resend.
```

