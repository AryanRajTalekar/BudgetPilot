import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

// ─────────────────────────────────────────────────────────────────
// FEATURE 2: Weekly Finance Digest Email Template
// ─────────────────────────────────────────────────────────────────

export function WeeklyDigestEmail({
  userName,
  weekStart,
  weekEnd,
  income,
  expenses,
  byCategory,
  insights,
  recentTransactions,
  budget,
}) {
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const net = income - expenses;
  const isPositive = net >= 0;

  const topCategories = Object.entries(byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const budgetPct = budget?.amount > 0
    ? Math.min(100, Math.round((budget.spent / budget.amount) * 100))
    : 0;

  const dateRange = `${new Date(weekStart).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – ${new Date(weekEnd).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;

  return (
    <Html>
      <Head />
      <Preview>Weekly digest: {fmt(expenses)} spent • {fmt(net)} {isPositive ? "saved" : "over"} this week</Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Header */}
          <Section style={s.header}>
            <Text style={s.logo}>BudgetPilot</Text>
            <Heading style={s.heading}>Weekly Finance Digest</Heading>
            <Text style={s.subheading}>{dateRange}</Text>
          </Section>

          {/* Greeting + summary */}
          <Section style={s.section}>
            <Text style={s.greeting}>Hey {userName || "there"} 👋</Text>
            <Text style={s.bodyText}>{insights?.summary}</Text>
          </Section>

          {/* Stats */}
          <Section style={{ padding: "0 32px 24px" }}>
            <Row>
              <Column style={s.stat}>
                <Text style={s.statLabel}>Income</Text>
                <Text style={{ ...s.statVal, color: "#10B981" }}>{fmt(income)}</Text>
              </Column>
              <Column style={s.stat}>
                <Text style={s.statLabel}>Spent</Text>
                <Text style={{ ...s.statVal, color: "#EF4444" }}>{fmt(expenses)}</Text>
              </Column>
              <Column style={s.stat}>
                <Text style={s.statLabel}>Net</Text>
                <Text style={{ ...s.statVal, color: isPositive ? "#10B981" : "#EF4444" }}>
                  {isPositive ? "+" : ""}{fmt(net)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={s.divider} />

          {/* Monthly Budget Progress */}
          {budget && (
            <Section style={s.section}>
              <Text style={s.sectionTitle}>Monthly Budget</Text>
              <Row>
                <Column>
                  <Text style={s.bodyText}>
                    {fmt(budget.spent)} of {fmt(budget.amount)} used ({budgetPct}%)
                  </Text>
                </Column>
              </Row>
              <Section style={s.progressBg}>
                <Section
                  style={{
                    ...s.progressFill,
                    width: `${budgetPct}%`,
                    backgroundColor: budgetPct >= 90 ? "#EF4444" : budgetPct >= 75 ? "#F59E0B" : "#10B981",
                  }}
                />
              </Section>
            </Section>
          )}

          <Hr style={s.divider} />

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <Section style={s.section}>
              <Text style={s.sectionTitle}>Where Your Money Went</Text>
              {topCategories.map(([cat, amt], i) => {
                const pct = expenses > 0 ? Math.round((amt / expenses) * 100) : 0;
                return (
                  <Row key={i} style={{ marginBottom: "8px" }}>
                    <Column>
                      <Text style={s.catName}>{cat}</Text>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={s.catAmt}>{fmt(amt)}</Text>
                    </Column>
                    <Column style={{ textAlign: "right", minWidth: "40px" }}>
                      <Text style={s.catPct}>{pct}%</Text>
                    </Column>
                  </Row>
                );
              })}
            </Section>
          )}

          <Hr style={s.divider} />

          {/* AI Insights */}
          {insights?.insights?.length > 0 && (
            <Section style={s.section}>
              <Text style={s.sectionTitle}>AI Insights</Text>
              {insights.insights.map((tip, i) => (
                <Text key={i} style={s.insight}>
                  {i === 0 ? "💡" : i === 1 ? "📌" : "✅"} {tip}
                </Text>
              ))}
            </Section>
          )}

          {/* Overspending Alert */}
          {insights?.overspendingAlert && (
            <Section style={s.alertBox}>
              <Text style={s.alertTitle}>⚠️ Watch Out</Text>
              <Text style={s.alertText}>
                Your <strong>{insights.overspendingAlert}</strong> spending is higher than usual. Review it before next week.
              </Text>
            </Section>
          )}

          {/* Saving Suggestion */}
          {insights?.savingsSuggestion && (
            <Section style={s.tipBox}>
              <Text style={s.tipLabel}>🎯 Next Week Goal</Text>
              <Text style={s.tipText}>{insights.savingsSuggestion}</Text>
            </Section>
          )}

          {/* Recent Transactions */}
          {recentTransactions?.length > 0 && (
            <>
              <Hr style={s.divider} />
              <Section style={s.section}>
                <Text style={s.sectionTitle}>Recent Transactions</Text>
                {recentTransactions.map((t, i) => (
                  <Row key={i} style={{ marginBottom: "8px" }}>
                    <Column>
                      <Text style={s.txDesc}>{t.description || t.category}</Text>
                      <Text style={s.txDate}>
                        {new Date(t.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </Text>
                    </Column>
                    <Column style={{ textAlign: "right" }}>
                      <Text style={{ ...s.txAmt, color: t.type === "EXPENSE" ? "#EF4444" : "#10B981" }}>
                        {t.type === "EXPENSE" ? "-" : "+"}{fmt(t.amount.toNumber ? t.amount.toNumber() : t.amount)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </>
          )}

          <Hr style={s.divider} />
          <Text style={s.footer}>© {new Date().getFullYear()} BudgetPilot · You&apos;re receiving this because weekly digests are enabled.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const s = {
  body: { backgroundColor: "#F3F4F6", fontFamily: "-apple-system, 'Segoe UI', sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden" },
  header: { background: "#111827", padding: "28px 32px", textAlign: "center" },
  logo: { color: "#6B7280", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" },
  heading: { color: "#FFFFFF", fontSize: "24px", fontWeight: "700", margin: "0 0 4px" },
  subheading: { color: "#9CA3AF", fontSize: "14px", margin: "0" },
  section: { padding: "20px 32px" },
  greeting: { fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 6px" },
  bodyText: { fontSize: "14px", color: "#4B5563", lineHeight: "1.6", margin: "0" },
  stat: { textAlign: "center", padding: "12px 8px", backgroundColor: "#F9FAFB", borderRadius: "8px", margin: "0 4px" },
  statLabel: { fontSize: "11px", color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" },
  statVal: { fontSize: "18px", fontWeight: "700", margin: "0" },
  divider: { borderColor: "#E5E7EB", margin: "0 32px" },
  sectionTitle: { fontSize: "14px", fontWeight: "600", color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" },
  progressBg: { backgroundColor: "#E5E7EB", borderRadius: "999px", height: "8px", margin: "8px 0 0", overflow: "hidden" },
  progressFill: { height: "8px", borderRadius: "999px" },
  catName: { fontSize: "13px", color: "#374151", margin: "0", textTransform: "capitalize" },
  catAmt: { fontSize: "13px", fontWeight: "600", color: "#111827", margin: "0" },
  catPct: { fontSize: "12px", color: "#9CA3AF", margin: "0" },
  insight: { fontSize: "13px", color: "#374151", lineHeight: "1.6", margin: "0 0 8px", paddingLeft: "4px" },
  alertBox: { margin: "0 32px 16px", backgroundColor: "#FEF2F2", borderRadius: "8px", padding: "14px 16px", borderLeft: "3px solid #EF4444" },
  alertTitle: { fontSize: "12px", fontWeight: "700", color: "#991B1B", margin: "0 0 4px" },
  alertText: { fontSize: "13px", color: "#7F1D1D", margin: "0" },
  tipBox: { margin: "0 32px 20px", backgroundColor: "#F0FDF4", borderRadius: "8px", padding: "14px 16px", borderLeft: "3px solid #10B981" },
  tipLabel: { fontSize: "12px", fontWeight: "700", color: "#065F46", margin: "0 0 4px" },
  tipText: { fontSize: "13px", color: "#064E3B", margin: "0" },
  txDesc: { fontSize: "13px", color: "#374151", margin: "0 0 2px" },
  txDate: { fontSize: "11px", color: "#9CA3AF", margin: "0" },
  txAmt: { fontSize: "13px", fontWeight: "600", margin: "0" },
  footer: { fontSize: "11px", color: "#9CA3AF", textAlign: "center", padding: "16px 32px", margin: "0" },
};

export default WeeklyDigestEmail;