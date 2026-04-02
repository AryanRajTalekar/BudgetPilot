"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    q: "Is BudgetPilot free to use?",
    a: "Yes, BudgetPilot offers a free plan with essential features. Upgrade anytime for AI insights, automation, and advanced analytics.",
    highlight: true,
  },
  {
    q: "How does BudgetPilot track my expenses?",
    a: "You can manually log expenses or connect accounts securely. BudgetPilot automatically categorizes and analyzes your spending patterns.",
    highlight: false,
  },
  {
    q: "Is my financial data secure?",
    a: "Absolutely. We use bank-level encryption, secure authentication (Clerk), and never share your data with third parties.",
    highlight: false,
  },
  {
    q: "Can I set savings goals?",
    a: "Yes, create custom goals and track progress in real-time with AI-powered recommendations to stay on track.",
    highlight: true,
  },
  {
    q: "Does BudgetPilot send alerts?",
    a: "Yes, you’ll receive smart alerts for overspending, unusual activity, bill reminders, and goal updates.",
    highlight: true,
  },
  {
    q: "Can I use BudgetPilot on multiple devices?",
    a: "Yes, your data syncs seamlessly across devices using secure cloud infrastructure.",
    highlight: false,
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="faq"
      className="relative bg-white dark:bg-black py-16 md:py-24 overflow-hidden transition-colors duration-300"
    >
      {/* Glow */}
      <div className="absolute left-0 bottom-0 w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full bg-[#E63946]/15 blur-[70px] md:blur-[90px]" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="mb-3 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest text-[#E63946] font-semibold">
            FAQ
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black dark:text-white leading-tight mb-10 md:mb-12 text-center md:text-left">
          Frequently Asked
          <br />
          Questions
        </h2>

        {/* Decorative star (desktop only) */}
        <span className="hidden md:block absolute top-28 right-12 text-black dark:text-white text-2xl select-none">
          ✦
        </span>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onClick={() => setOpen(open === i ? null : i)}
              className={`rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 ${
                open === i
                  ? "bg-[#E63946] text-white md:scale-[1.02]"
                  : faq.highlight
                  ? "bg-[#E63946]/90 text-white"
                  : "bg-gray-50 dark:bg-neutral-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-sm sm:text-base leading-snug">
                  {faq.q}
                </h3>

                <span
                  className={`text-lg font-bold flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>

              {open === i && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                    faq.highlight ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {faq.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;