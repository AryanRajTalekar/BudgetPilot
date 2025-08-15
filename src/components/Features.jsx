import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

// Import your Lottie JSON files
import expenseAnim from "../assets/lottie/expense.json";
import budgetAnim from "../assets/lottie/budget.json";
import loanAnim from "../assets/lottie/loan.json";
import investAnim from "../assets/lottie/invest.json";
import dashboardAnim from "../assets/lottie/dashboard.json";

export default function ScrollTriggered() {
  return (
    <div style={container}>
      {features.map((feature, i) => (
        <Card
          key={i}
          i={i}
          animation={feature.animation}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
}

function Card({ animation, title, description, i }) {
  return (
    <motion.div
      className={`card-container-${i}`}
      style={cardContainer}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.6 }}
    >
      <motion.div style={card} variants={cardVariants}>
        <Lottie animationData={animation} loop={true} style={{ width: 450, height: 450 }} />
        <h3 style={{ fontSize: "2.5vw", marginTop: "10px", color: "#16a34a" }}>
          {title}
        </h3>
        <p
          style={{
            fontSize: "18px",
            textAlign: "center",
            marginTop: "8px",
            color: "#ccc",
            lineHeight: "1.4",
          }}
        >
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}

const cardVariants = {
  offscreen: { y: 300, opacity: 0 },
  onscreen: {
    y: 50,
    opacity: 1,
    transition: { type: "spring", bounce: 0.4, duration: 0.8 },
  },
};

const container = {
  background: "#000",
  padding: "100px 0",
  width: "100%",
};

const cardContainer = {
  overflow: "visible",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  paddingTop: 40,
  marginBottom: 80,
};

const card = {
  width: "70vw",
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 20,
  background: "#111",
  boxShadow: "0 0 15px rgba(0,0,0,0.4)",
  padding: "20px",
  zIndex: 1,
};

const features = [
  {
    title: "Automated Expense Management",
    description: "Track, extract, and categorize expenses using OCR and AI — no manual entry required.",
    animation: expenseAnim,
  },
  {
    title: "Smart Budgeting",
    description: "Allocate income across expenses, EMIs, and investments with AI-powered suggestions.",
    animation: budgetAnim,
  },
  {
    title: "Loan & Insurance Analysis",
    description: "Get personalized recommendations for loan eligibility and insurance coverage.",
    animation: loanAnim,
  },
  {
    title: "Investment Advice",
    description: "Plan investments with top NIFTY stock picks and portfolio diversification tips.",
    animation: investAnim,
  },
  {
    title: "Unified Dashboard",
    description: "All your finances in one place — expenses, loans, investments, and alerts.",
    animation: dashboardAnim,
  },
];
