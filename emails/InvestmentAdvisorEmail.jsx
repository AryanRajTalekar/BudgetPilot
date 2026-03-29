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
// FEATURE 1: Investment Advisor Email Template
// Usage: InvestmentAdvisorEmail({ userName, surplus, income, expenses, advice, month })
// ─────────────────────────────────────────────────────────────────

export function InvestmentAdvisorEmail({ userName, surplus, income, expenses, advice, month }) {
  const fmt = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const allocationColors = {
    "Emergency Fund":    { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
    "SIP - Mutual Fund": { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    "Fixed Deposit":     { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6" },
    "Index Fund":        { bg: "#F5F3FF", text: "#4C1D95", dot: "#8B5CF6" },
  };

  return (
    <Html>
      <Head />
      <Preview>
        Your {month} Investment Plan — {fmt(surplus)} surplus ready to grow
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>BudgetPilot</Text>
            <Heading style={styles.heading}>Your Investment Plan</Heading>
            <Text style={styles.subheading}>{month}</Text>
          </Section>

          {/* Greeting */}
          <Section style={styles.section}>
            <Text style={styles.greeting}>Hi {userName || "there"} 👋</Text>
            <Text style={styles.body_text}>{advice?.summary}</Text>
          </Section>

          {/* Snapshot */}
          <Section style={styles.statsRow}>
            <Row>
              <Column style={styles.statCell}>
                <Text style={styles.statLabel}>Monthly Income</Text>
                <Text style={{ ...styles.statValue, color: "#10B981" }}>{fmt(income)}</Text>
              </Column>
              <Column style={styles.statCell}>
                <Text style={styles.statLabel}>Total Expenses</Text>
                <Text style={{ ...styles.statValue, color: "#EF4444" }}>{fmt(expenses)}</Text>
              </Column>
              <Column style={styles.statCell}>
                <Text style={styles.statLabel}>Investable Surplus</Text>
                <Text style={{ ...styles.statValue, color: "#6366F1" }}>{fmt(surplus)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* Allocations */}
          <Section style={styles.section}>
            <Heading as="h2" style={styles.sectionTitle}>
              Recommended Allocation
            </Heading>

            {advice?.allocations?.map((alloc, i) => {
              const color = allocationColors[alloc.type] || {
                bg: "#F3F4F6", text: "#1F2937", dot: "#6B7280",
              };
              return (
                <Section key={i} style={{ ...styles.allocCard, backgroundColor: color.bg }}>
                  <Row>
                    <Column style={{ width: "8px" }}>
                      <Text style={{ ...styles.dot, color: color.dot }}>●</Text>
                    </Column>
                    <Column style={{ paddingLeft: "12px" }}>
                      <Row>
                        <Column>
                          <Text style={{ ...styles.allocType, color: color.text }}>
                            {alloc.type}
                          </Text>
                          <Text style={styles.allocReason}>{alloc.reason}</Text>
                          <Text style={styles.allocAction}>→ {alloc.action}</Text>
                        </Column>
                        <Column style={styles.allocAmountCol}>
                          <Text style={{ ...styles.allocAmount, color: color.text }}>
                            {fmt(alloc.amount)}
                          </Text>
                          <Text style={styles.allocPct}>{alloc.percentage}%</Text>
                        </Column>
                      </Row>
                    </Column>
                  </Row>
                </Section>
              );
            })}
          </Section>

          <Hr style={styles.divider} />

          {/* Top Tip */}
          {advice?.topTip && (
            <Section style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡 Top Tip</Text>
              <Text style={styles.tipText}>{advice.topTip}</Text>
            </Section>
          )}

          {/* Goal Nudge */}
          {advice?.goalNudge && (
            <Section style={styles.goalBox}>
              <Text style={styles.tipLabel}>🎯 Goal Insight</Text>
              <Text style={styles.tipText}>{advice.goalNudge}</Text>
            </Section>
          )}

          {/* Footer */}
          <Hr style={styles.divider} />
          <Text style={styles.footer}>
            This is AI-generated financial guidance for informational purposes only.
            Please consult a SEBI-registered advisor before making investment decisions.
          </Text>
          <Text style={styles.footer}>© {new Date().getFullYear()} BudgetPilot</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#F9FAFB", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#FFFFFF", borderRadius: "12px", overflow: "hidden" },
  header: { backgroundColor: "#4F46E5", padding: "32px 40px", textAlign: "center" },
  logo: { color: "#C7D2FE", fontSize: "13px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" },
  heading: { color: "#FFFFFF", fontSize: "26px", fontWeight: "700", margin: "0 0 4px" },
  subheading: { color: "#A5B4FC", fontSize: "15px", margin: "0" },
  section: { padding: "24px 40px" },
  greeting: { fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 8px" },
  body_text: { fontSize: "15px", color: "#4B5563", lineHeight: "1.6", margin: "0" },
  statsRow: { padding: "0 40px 24px" },
  statCell: { textAlign: "center", padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px" },
  statLabel: { fontSize: "12px", color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "20px", fontWeight: "700", margin: "0" },
  divider: { borderColor: "#E5E7EB", margin: "0 40px" },
  sectionTitle: { fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 16px" },
  allocCard: { borderRadius: "8px", padding: "16px", marginBottom: "10px" },
  dot: { fontSize: "20px", margin: "0", lineHeight: "1.4" },
  allocType: { fontSize: "14px", fontWeight: "700", margin: "0 0 2px" },
  allocReason: { fontSize: "12px", color: "#6B7280", margin: "0 0 4px" },
  allocAction: { fontSize: "12px", color: "#374151", fontStyle: "italic", margin: "0" },
  allocAmountCol: { textAlign: "right", minWidth: "80px" },
  allocAmount: { fontSize: "16px", fontWeight: "700", margin: "0 0 2px" },
  allocPct: { fontSize: "12px", color: "#9CA3AF", margin: "0" },
  tipBox: { margin: "0 40px 16px", backgroundColor: "#FFFBEB", borderRadius: "8px", padding: "16px", borderLeft: "4px solid #F59E0B" },
  goalBox: { margin: "0 40px 24px", backgroundColor: "#EEF2FF", borderRadius: "8px", padding: "16px", borderLeft: "4px solid #6366F1" },
  tipLabel: { fontSize: "12px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" },
  tipText: { fontSize: "14px", color: "#374151", lineHeight: "1.6", margin: "0" },
  footer: { fontSize: "11px", color: "#9CA3AF", textAlign: "center", padding: "0 40px", margin: "8px 0", lineHeight: "1.5" },
};

export default InvestmentAdvisorEmail;