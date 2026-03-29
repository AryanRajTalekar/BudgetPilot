import {
  Body, Container, Head, Heading, Hr,
  Html, Preview, Section, Text, Row, Column,
} from "@react-email/components";

export function NewsletterEmail({ weekNumber, date, marketSummary, ideas }) {
  return (
    <Html>
      <Head />
      <Preview>
        This week in markets: {marketSummary?.headline ?? "Your weekly finance digest"}
      </Preview>
      <Body style={s.body}>
        <Container style={s.container}>

          {/* Header */}
          <Section style={s.header}>
            <Text style={s.logo}>BudgetPilot</Text>
            <Heading style={s.heading}>Weekly Market Digest</Heading>
            <Text style={s.sub}>Week of {date}</Text>
          </Section>

          {/* Market Summary */}
          <Section style={s.section}>
            <Text style={s.label}>Market Pulse</Text>
            <Text style={s.headline}>{marketSummary?.headline}</Text>
            <Text style={s.body2}>{marketSummary?.summary}</Text>
          </Section>

          <Hr style={s.divider} />

          {/* Market Snapshot */}
          {marketSummary?.indices?.length > 0 && (
            <Section style={s.section}>
              <Text style={s.label}>Indices This Week</Text>
              {marketSummary.indices.map((idx, i) => (
                <Row key={i} style={{ marginBottom: "10px" }}>
                  <Column>
                    <Text style={s.idxName}>{idx.name}</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={{
                      ...s.idxChange,
                      color: idx.change?.startsWith("+") ? "#10B981" : "#EF4444"
                    }}>
                      {idx.change}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          <Hr style={s.divider} />

          {/* Investment Ideas */}
          <Section style={s.section}>
            <Text style={s.label}>Investment Ideas This Week</Text>
            {ideas?.map((idea, i) => (
              <Section key={i} style={s.ideaBox}>
                <Text style={s.ideaTitle}>{idea.title}</Text>
                <Text style={s.ideaBody}>{idea.description}</Text>
                {idea.tip && (
                  <Text style={s.ideaTip}>💡 {idea.tip}</Text>
                )}
              </Section>
            ))}
          </Section>

          <Hr style={s.divider} />

          {/* Disclaimer + Footer */}
          <Text style={s.disclaimer}>
            This newsletter is for educational purposes only and does not constitute financial advice. Always consult a SEBI-registered advisor before investing.
          </Text>
          <Text style={s.footer}>
            © {new Date().getFullYear()} BudgetPilot · You received this because you subscribed to our newsletter.
          </Text>
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
  sub: { color: "#9CA3AF", fontSize: "14px", margin: "0" },
  section: { padding: "20px 32px" },
  label: { fontSize: "11px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" },
  headline: { fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px", lineHeight: "1.4" },
  body2: { fontSize: "14px", color: "#4B5563", lineHeight: "1.7", margin: "0" },
  divider: { borderColor: "#E5E7EB", margin: "0 32px" },
  idxName: { fontSize: "14px", color: "#374151", margin: "0", fontWeight: "500" },
  idxChange: { fontSize: "14px", fontWeight: "700", margin: "0" },
  ideaBox: { backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "14px 16px", marginBottom: "12px", borderLeft: "3px solid #E63946" },
  ideaTitle: { fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 6px" },
  ideaBody: { fontSize: "13px", color: "#4B5563", lineHeight: "1.6", margin: "0 0 6px" },
  ideaTip: { fontSize: "12px", color: "#065F46", margin: "0", fontStyle: "italic" },
  disclaimer: { fontSize: "11px", color: "#9CA3AF", padding: "0 32px", lineHeight: "1.6", margin: "0" },
  footer: { fontSize: "11px", color: "#9CA3AF", textAlign: "center", padding: "12px 32px 20px", margin: "0" },
};

export default NewsletterEmail;